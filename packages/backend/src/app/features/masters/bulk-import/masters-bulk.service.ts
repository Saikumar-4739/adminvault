import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { DeviceConfigService } from '../brand/brand.service';
import { DepartmentService } from '../department/department.service';
import { CompanyInfoService } from '../company-info/company-info.service';
import { AssetTypeService } from '../asset-type/asset-type.service';
import { LicenseService } from '../license/license.service';
import { VendorService } from '../vendor/vendor.service';
import { CreateDeviceConfigModel, CreateDepartmentModel, CreateCompanyModel, CreateAssetTypeModel, CreateLicenseMasterModel, CreateVendorModel } from '@adminvault/shared-models';
import { GlobalResponse } from '@adminvault/backend-utils';

@Injectable()
export class MastersBulkService {
    private readonly logger = new Logger(MastersBulkService.name);

    constructor(
        private readonly deviceConfigService: DeviceConfigService,
        private readonly departmentService: DepartmentService,
        private readonly companyService: CompanyInfoService,
        private readonly assetTypeService: AssetTypeService,
        private readonly licenseService: LicenseService,
        private readonly vendorService: VendorService,
    ) { }

    async bulkImport(file: Express.Multer.File): Promise<GlobalResponse> {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);

        const summary = {
            deviceConfigs: { success: 0, failed: 0, errors: [] },
            departments: { success: 0, failed: 0, errors: [] },
            companies: { success: 0, failed: 0, errors: [] },
            assetTypes: { success: 0, failed: 0, errors: [] },
            licenses: { success: 0, failed: 0, errors: [] },
            vendors: { success: 0, failed: 0, errors: [] },
            others: []
        };


        for (const worksheet of workbook.worksheets) {
            const sheetName = worksheet.name.trim().toLowerCase();
            this.logger.log(`Processing sheet: ${sheetName}`);

            if (sheetName === 'deviceconfigs' || sheetName === 'device configurations' || sheetName === 'brands') {
                await this.processDeviceConfigs(worksheet, summary.deviceConfigs);
            } else if (sheetName === 'departments') {
                await this.processDepartments(worksheet, summary.departments);
            } else if (sheetName === 'companies') {
                await this.processCompanies(worksheet, summary.companies);
            } else if (sheetName === 'assettypes' || sheetName === 'asset types') {
                await this.processAssetTypes(worksheet, summary.assetTypes);
            } else if (sheetName === 'licenses' || sheetName === 'applications') {
                await this.processLicenses(worksheet, summary.licenses);
            } else if (sheetName === 'vendors') {
                await this.processVendors(worksheet, summary.vendors);
            } else {
                summary.others.push(`Sheet '${worksheet.name}' not recognized or supported yet.`);
            }
        }

        return new GlobalResponse(true, 200, 'Bulk import completed', summary);
    }

    private async processDeviceConfigs(sheet: ExcelJS.Worksheet, stats: { success: number, failed: number, errors: string[] }) {
        // Assume row 1 is header
        const headers: { [key: string]: number } = {};
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            headers[cell.text.toLowerCase().replace(/\s+/g, '')] = colNumber;
        });

        const rows = sheet.getRows(2, sheet.rowCount) || [];

        // Iterate from row 2
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (!row.hasValues) continue;

            const laptopCompany = this.getCellValue(row, headers['laptopcompany'] || headers['name']);
            const modelName = this.getCellValue(row, headers['model']);

            // Minimal validation
            if (!laptopCompany || !modelName) {
                if (!laptopCompany && !modelName) continue;
                stats.failed++;
                stats.errors.push(`Row ${i}: Missing laptop company or model`);
                continue;
            }

            const createModel = new CreateDeviceConfigModel(
                1, // Default userId
                0, // companyId
                `${laptopCompany} ${modelName}`,
                String(this.getCellValue(row, headers['configuration']) || ''),
                this.getCellValue(row, headers['isactive']) === true || String(this.getCellValue(row, headers['isactive'])).toLowerCase() === 'true',
                String(laptopCompany),
                String(modelName),
                String(this.getCellValue(row, headers['configuration']) || ''),
                String(this.getCellValue(row, headers['ram']) || ''),
                String(this.getCellValue(row, headers['storage']) || '')
            );

            try {
                await this.deviceConfigService.createDeviceConfig(createModel);
                stats.success++;
            } catch (error: any) {
                stats.failed++;
                stats.errors.push(`Row ${i} (${laptopCompany} ${modelName}): ${error.message || 'Unknown error'}`);
            }
        }
    }

    private async processDepartments(sheet: ExcelJS.Worksheet, stats: { success: number, failed: number, errors: string[] }) {
        const headers: { [key: string]: number } = {};
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            headers[cell.text.toLowerCase()] = colNumber;
        });

        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (!row.hasValues) continue;

            const name = this.getCellValue(row, headers['name']);
            const code = this.getCellValue(row, headers['code']);
            const compId = this.getCellValue(row, headers['companyid']);

            if (!name) {
                if (!name && !code) continue;
                stats.failed++;
                stats.errors.push(`Row ${i}: Missing name`);
                continue;
            }

            const model: CreateDepartmentModel = {
                name: String(name),
                description: String(this.getCellValue(row, headers['description']) || ''),
                isActive: this.getCellValue(row, headers['isactive']) === true || String(this.getCellValue(row, headers['isactive'])).toLowerCase() === 'true',
                companyId: Number(compId || 1), // Default to 1 if not provided
                userId: 1 // Default user ID
            };

            try {
                await this.departmentService.createDepartment(model);
                stats.success++;
            } catch (error: any) {
                stats.failed++;
                stats.errors.push(`Row ${i} (${name}): ${error.message || 'Unknown error'}`);
            }
        }
    }

    private async processAssetTypes(sheet: ExcelJS.Worksheet, stats: { success: number, failed: number, errors: string[] }) {
        const headers = this.getHeaders(sheet);
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (!row.hasValues) continue;

            const name = this.getCellValue(row, headers['name']);
            if (!name) {
                stats.failed++;
                stats.errors.push(`Row ${i}: Missing name`);
                continue;
            }

            const model: CreateAssetTypeModel = {
                name: String(name),
                description: String(this.getCellValue(row, headers['description']) || ''),
                isActive: this.getCellValue(row, headers['isactive']) === true || String(this.getCellValue(row, headers['isactive'])).toLowerCase() === 'true',
                userId: 1
            };

            try {
                await this.assetTypeService.createAssetType(model);
                stats.success++;
            } catch (error: any) {
                stats.failed++;
                stats.errors.push(`Row ${i} (${name}): ${error.message}`);
            }
        }
    }

    private async processLicenses(sheet: ExcelJS.Worksheet, stats: { success: number, failed: number, errors: string[] }) {
        const headers = this.getHeaders(sheet);
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (!row.hasValues) continue;

            const name = this.getCellValue(row, headers['name']);
            if (!name) {
                stats.failed++;
                stats.errors.push(`Row ${i}: Missing name`);
                continue;
            }

            const model: CreateLicenseMasterModel = {
                companyId: 1, // Default to 1 as per requirements or extract from sheet
                name: String(name),
                description: String(this.getCellValue(row, headers['description']) || ''),
                isActive: this.getCellValue(row, headers['isactive']) === true || String(this.getCellValue(row, headers['isactive'])).toLowerCase() === 'true',
                purchaseDate: new Date(String(this.getCellValue(row, headers['purchasedate']) || new Date().toISOString())),
                expiryDate: new Date(String(this.getCellValue(row, headers['expirydate']) || new Date().toISOString())),
                userId: 1
            };

            try {
                await this.licenseService.createLicense(model);
                stats.success++;
            } catch (error: any) {
                stats.failed++;
                stats.errors.push(`Row ${i} (${name}): ${error.message}`);
            }
        }
    }

    private getHeaders(sheet: ExcelJS.Worksheet): { [key: string]: number } {
        const headers: { [key: string]: number } = {};
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell, colNumber) => {
            headers[cell.text.replace(/\s+/g, '').toLowerCase()] = colNumber;
        });
        return headers;
    }

    private async processCompanies(sheet: ExcelJS.Worksheet, stats: { success: number, failed: number, errors: string[] }) {
        const headers = this.getHeaders(sheet);
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (!row.hasValues) continue;

            const name = this.getCellValue(row, headers['companyname']);
            if (!name) {
                stats.failed++;
                stats.errors.push(`Row ${i}: Missing companyName`);
                continue;
            }

            const model: CreateCompanyModel = {
                companyName: String(name),
                location: String(this.getCellValue(row, headers['location']) || ''),
                estDate: new Date(String(this.getCellValue(row, headers['estdate']) || new Date().toISOString())),
                email: String(this.getCellValue(row, headers['email']) || ''),
                phone: String(this.getCellValue(row, headers['phone']) || ''),
                userId: 1
            };

            try {
                await this.companyService.createCompany(model);
                stats.success++;
            } catch (error: any) {
                stats.failed++;
                stats.errors.push(`Row ${i} (${name}): ${error.message}`);
            }
        }
    }

    private async processVendors(sheet: ExcelJS.Worksheet, stats: { success: number, failed: number, errors: string[] }) {
        const headers = this.getHeaders(sheet);
        for (let i = 2; i <= sheet.rowCount; i++) {
            const row = sheet.getRow(i);
            if (!row.hasValues) continue;

            const name = this.getCellValue(row, headers['name']);
            if (!name) {
                stats.failed++;
                stats.errors.push(`Row ${i}: Missing name`);
                continue;
            }

            const model: CreateVendorModel = {
                name: String(name),
                description: String(this.getCellValue(row, headers['description']) || ''),
                isActive: this.getCellValue(row, headers['isactive']) === true || String(this.getCellValue(row, headers['isactive'])).toLowerCase() === 'true',
                contactPerson: String(this.getCellValue(row, headers['contactperson']) || ''),
                email: String(this.getCellValue(row, headers['email']) || ''),
                phone: String(this.getCellValue(row, headers['phone']) || ''),
                address: String(this.getCellValue(row, headers['address']) || ''),
                userId: 1
            };

            try {
                await this.vendorService.createVendor(model);
                stats.success++;
            } catch (error: any) {
                stats.failed++;
                stats.errors.push(`Row ${i} (${name}): ${error.message}`);
            }
        }
    }

    private getCellValue(row: ExcelJS.Row, colIndex: number): any {
        if (!colIndex) return null;
        const cell = row.getCell(colIndex);
        return cell.value;
    }

    async generateTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();

        // Device Configurations Sheet
        const configSheet = workbook.addWorksheet('Device Configurations');
        configSheet.columns = [
            { header: 'Laptop Company', key: 'laptopCompany', width: 30 },
            { header: 'Model', key: 'model', width: 30 },
            { header: 'Configuration', key: 'configuration', width: 40 },
            { header: 'RAM', key: 'ram', width: 15 },
            { header: 'Storage', key: 'storage', width: 15 },
            { header: 'IsActive', key: 'isActive', width: 10 },
        ];
        configSheet.addRow({ laptopCompany: 'Dell', model: 'Latitude 5420', configuration: 'i5, 11th Gen', ram: '16GB', storage: '512GB SSD', isActive: true });

        // Departments Sheet
        const deptSheet = workbook.addWorksheet('Departments');
        deptSheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Code', key: 'code', width: 20 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'IsActive', key: 'isActive', width: 10 },
            { header: 'CompanyId', key: 'companyId', width: 15 },
        ];
        deptSheet.addRow({ name: 'Example Dept', code: 'EX_DEPT', description: 'IT Department', isActive: true, companyId: 1 });

        // Companies Sheet
        const companySheet = workbook.addWorksheet('Companies');
        companySheet.columns = [
            { header: 'CompanyName', key: 'companyName', width: 30 },
            { header: 'Location', key: 'location', width: 30 },
            { header: 'EstDate', key: 'estDate', width: 20 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 20 },
        ];
        companySheet.addRow({ companyName: 'Example Inc', location: 'New York', estDate: new Date().toISOString().split('T')[0], email: 'info@example.com', phone: '1234567890' });

        // Asset Types Sheet
        const assetTypeSheet = workbook.addWorksheet('Asset Types');
        assetTypeSheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Code', key: 'code', width: 20 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'IsActive', key: 'isActive', width: 10 },
        ];
        assetTypeSheet.addRow({ name: 'Laptop', code: 'AT_LAPTOP', description: 'Portable computers', isActive: true });

        // Applications Sheet
        const appSheet = workbook.addWorksheet('Applications');
        appSheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Code', key: 'code', width: 20 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'IsActive', key: 'isActive', width: 10 },
            { header: 'OwnerName', key: 'ownerName', width: 30 },
            { header: 'AppReleaseDate', key: 'appReleaseDate', width: 20 },
        ];
        appSheet.addRow({ name: 'HRMS', code: 'APP_HRMS', description: 'HR Management System', isActive: true, ownerName: 'HR Dept', appReleaseDate: new Date().toISOString().split('T')[0] });

        // Vendors Sheet
        const vendorSheet = workbook.addWorksheet('Vendors');
        vendorSheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Code', key: 'code', width: 20 },
            { header: 'Description', key: 'description', width: 40 },
            { header: 'IsActive', key: 'isActive', width: 10 },
            { header: 'ContactPerson', key: 'contactPerson', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 20 },
            { header: 'Address', key: 'address', width: 40 },
        ];
        vendorSheet.addRow({ name: 'Tech Vendor', code: 'V_TECH', description: 'IT Supplier', isActive: true, contactPerson: 'John Doe', email: 'sales@techvendor.com', phone: '0987654321', address: '123 Tech St' });

        return await workbook.xlsx.writeBuffer() as unknown as Buffer;
    }
}
