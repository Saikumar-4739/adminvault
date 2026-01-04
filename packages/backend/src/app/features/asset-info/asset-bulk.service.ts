import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { AssetInfoRepository } from '../../repository/asset-info.repository';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import {
    AssetStatusEnum,
    BulkImportResponseModel,
    CreateAssetModel
} from '@adminvault/shared-models';

@Injectable()
export class AssetBulkService {
    constructor(
        private dataSource: DataSource,
        private assetInfoRepo: AssetInfoRepository
    ) { }

    async processBulkImport(fileBuffer: Buffer, companyId: number, userId: number): Promise<BulkImportResponseModel> {
        try {
            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON (array of arrays)
            const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!rows || rows.length < 2) {
                return new BulkImportResponseModel(false, 400, 'File is empty or missing headers', 0, 0, []);
            }

            const successRows: CreateAssetModel[] = [];
            const errors: { row: number; error: string }[] = [];
            let successCount = 0;

            // Start from index 1 to skip header
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                // Skip empty rows
                if (!row || row.length === 0) continue;

                try {
                    // Map columns based on template:
                    // 0: Asset Type ID, 1: Brand ID, 2: Model, 3: Serial Number, 
                    // 4: Configuration, 5: Purchase Date, 6: Status

                    const assetTypeId = Number(row[0]);
                    const brandId = Number(row[1]);
                    const model = row[2]?.toString();
                    const serialNumber = row[3]?.toString();
                    const configuration = row[4]?.toString();
                    const purchaseDateStr = row[5];
                    const statusStr = row[6]?.toString()?.toLowerCase();

                    // Basic Validation
                    if (!assetTypeId || isNaN(assetTypeId)) throw new Error('Invalid Asset Type ID');
                    if (!brandId || isNaN(brandId)) throw new Error('Invalid Brand ID');
                    if (!model) throw new Error('Model is required');
                    if (!serialNumber) throw new Error('Serial Number is required');

                    let status = AssetStatusEnum.AVAILABLE;
                    if (statusStr === 'in_use') status = AssetStatusEnum.IN_USE;
                    else if (statusStr === 'maintenance') status = AssetStatusEnum.MAINTENANCE;
                    else if (statusStr === 'retired') status = AssetStatusEnum.RETIRED;

                    // Parse Date
                    let purchaseDate = new Date();
                    if (purchaseDateStr) {
                        const date = new Date(purchaseDateStr);
                        if (!isNaN(date.getTime())) purchaseDate = date;
                    }

                    // Create Asset Entity
                    const newAsset = new AssetInfoEntity();
                    newAsset.companyId = companyId;
                    newAsset.deviceId = assetTypeId; // Mapping AssetTypeId to DeviceId (entity property name)
                    newAsset.brandId = brandId;
                    newAsset.model = model;
                    newAsset.serialNumber = serialNumber;
                    newAsset.configuration = configuration;
                    newAsset.purchaseDate = purchaseDate;
                    newAsset.assetStatus = status;
                    newAsset.createdBy = userId;
                    newAsset.createdDate = new Date();
                    newAsset.isActive = true;
                    newAsset.isDeleted = false;
                    newAsset.userAssignedDate = null;
                    newAsset.assignedToEmployeeId = null;

                    // Save individually (for now, to handle partial success)
                    await this.assetInfoRepo.save(newAsset);
                    successCount++;
                } catch (err: any) {
                    errors.push({ row: i + 1, error: err.message });
                }
            }

            return new BulkImportResponseModel(
                true,
                200,
                `Processed ${rows.length - 1} rows. Success: ${successCount}, Failed: ${errors.length}`,
                successCount,
                errors.length,
                errors
            );

        } catch (error: any) {
            console.error('Bulk Import Error:', error);
            return new BulkImportResponseModel(false, 500, `Internal Server Error: ${error.message}`, 0, 0, []);
        }
    }
}
