import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { AssetStatusEnum, BulkImportRequestModel, BulkImportResponseModel } from '@adminvault/shared-models';
import { AssetInfoEntity } from './entities/asset-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';

@Injectable()
export class AssetBulkService {
    constructor(
        private dataSource: DataSource,
    ) { }

    async processBulkImport(reqModel: BulkImportRequestModel): Promise<BulkImportResponseModel> {
        try {
            const workbook = XLSX.read(reqModel.fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!rows || rows.length < 1) {
                return new BulkImportResponseModel(false, 400, 'File is empty', 0, 0, []);
            }

            // Skip header row if it exists (assuming first row is header)
            const dataRows = rows.slice(1);
            const errors: { row: number; error: string }[] = [];
            let successCount = 0;

            for (let i = 0; i < dataRows.length; i++) {
                const row = dataRows[i];
                const rowNumber = i + 2; // +1 for 0-index, +1 for header row

                if (!row || row.length === 0) continue;

                const transManager = new GenericTransactionManager(this.dataSource);
                try {
                    const assetTypeId = Number(row[0]);
                    const brandId = Number(row[1]);
                    const model = row[2]?.toString();
                    const serialNumber = row[3]?.toString();
                    const configuration = row[4]?.toString();
                    const purchaseDateStr = row[5];
                    const statusStr = row[6]?.toString()?.toLowerCase();

                    if (!assetTypeId || !brandId || !serialNumber) {
                        errors.push({ row: rowNumber, error: 'Asset Type ID, Brand ID and Serial Number are required' });
                        continue;
                    }

                    await transManager.startTransaction();

                    // Check for duplicate serial number
                    const existing = await transManager.getRepository(AssetInfoEntity).findOne({ where: { serialNumber } });
                    if (existing) {
                        throw new Error(`Serial number ${serialNumber} already exists`);
                    }

                    let status = AssetStatusEnum.AVAILABLE;
                    if (statusStr === 'in_use' || statusStr === 'in use') status = AssetStatusEnum.IN_USE;
                    else if (statusStr === 'maintenance') status = AssetStatusEnum.MAINTENANCE;
                    else if (statusStr === 'retired') status = AssetStatusEnum.RETIRED;

                    let purchaseDate: Date | null = null;
                    if (purchaseDateStr) {
                        const date = new Date(purchaseDateStr);
                        if (!isNaN(date.getTime())) purchaseDate = date;
                    }

                    const newAsset = new AssetInfoEntity();
                    newAsset.companyId = reqModel.companyId;
                    newAsset.deviceId = assetTypeId;
                    newAsset.brandId = brandId;
                    newAsset.model = model || '';
                    newAsset.serialNumber = serialNumber;
                    newAsset.configuration = configuration || '';
                    newAsset.purchaseDate = purchaseDate;
                    newAsset.assetStatusEnum = status;
                    newAsset.userId = reqModel.userId;

                    await transManager.getRepository(AssetInfoEntity).save(newAsset);
                    await transManager.completeTransaction();
                    successCount++;
                } catch (err: any) {
                    await transManager.releaseTransaction();
                    errors.push({ row: rowNumber, error: err.message || 'Unknown error' });
                }
            }

            const totalProcessed = dataRows.length;
            const message = `Bulk import completed. Total: ${totalProcessed}, Success: ${successCount}, Failed: ${errors.length}`;
            return new BulkImportResponseModel(errors.length === 0, 200, message, successCount, errors.length, errors);
        } catch (error: any) {
            throw new ErrorResponse(500, error.message || 'Failed to process bulk import');
        }
    }
}
