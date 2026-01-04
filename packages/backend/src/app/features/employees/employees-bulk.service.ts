import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { EmployeesEntity } from './entities/employees.entity';
import { EmployeesRepository } from './repositories/employees.repository';
import { DepartmentRepository } from '../masters/repositories/department.repository';
import {
    EmployeeStatusEnum,
    BulkImportResponseModel
} from '@adminvault/shared-models';

@Injectable()
export class EmployeesBulkService {
    constructor(
        private dataSource: DataSource,
        private employeesRepo: EmployeesRepository,
        private departmentRepo: DepartmentRepository
    ) { }

    async processBulkImport(fileBuffer: Buffer, companyId: number, userId: number): Promise<BulkImportResponseModel> {
        try {
            // 1. Fetch valid departments for lookup
            const departments = await this.departmentRepo.find({ where: { companyId } });

            // Create lookup maps
            const deptIdSet = new Set<number>(departments.map(d => d.id));
            const deptNameMap = new Map<string, number>(); // Name -> ID

            departments.forEach(d => {
                const normalizedName = d.name.toLowerCase().trim();
                deptNameMap.set(normalizedName, d.id);
            });

            const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert to JSON (array of arrays)
            const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!rows || rows.length < 2) {
                return new BulkImportResponseModel(false, 400, 'File is empty or missing headers', 0, 0, []);
            }

            const errors: { row: number; error: string }[] = [];
            let successCount = 0;

            // Start from index 1 to skip header
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                // Skip empty rows
                if (!row || row.length === 0) continue;

                try {
                    // Expected Template:
                    // 0: First Name, 1: Last Name, 2: Email, 3: Phone, 4: Department (ID or Name), 
                    // 5: Status (Active/Inactive), 6: Billing Amount, 7: Remarks

                    const firstName = row[0]?.toString().trim();
                    const lastName = row[1]?.toString().trim();
                    const email = row[2]?.toString().trim();
                    const phone = row[3]?.toString().trim();
                    const depInput = row[4]; // Can be string or number
                    const statusStr = row[5]?.toString().trim().toLowerCase();
                    const billingAmount = Number(row[6]);
                    const remarks = row[7]?.toString().trim();

                    // Validation & Resolution
                    if (!firstName) throw new Error('First Name is required');
                    if (!lastName) throw new Error('Last Name is required');
                    if (!email) throw new Error('Email is required');

                    let resolvedDepartmentId: number | undefined;

                    if (depInput) {
                        // Check if input is a valid Number ID
                        if (!isNaN(Number(depInput))) {
                            const idToCheck = Number(depInput);
                            if (deptIdSet.has(idToCheck)) {
                                resolvedDepartmentId = idToCheck;
                            }
                        }

                        // If not resolved yet, check by Name
                        if (!resolvedDepartmentId) {
                            const nameToCheck = depInput.toString().toLowerCase().trim();
                            if (deptNameMap.has(nameToCheck)) {
                                resolvedDepartmentId = deptNameMap.get(nameToCheck);
                            }
                        }
                    }

                    if (!resolvedDepartmentId) {
                        throw new Error(`Department '${depInput}' not found. Please provide a valid Department Name or ID.`);
                    }

                    // Check for existing email (optimization: could load all emails first, but row-by-row is safer for duplicates in file itself)
                    const existing = await this.employeesRepo.findOneBy({ email, companyId });
                    if (existing) {
                        throw new Error(`Email ${email} already exists`);
                    }

                    let status = EmployeeStatusEnum.ACTIVE;
                    if (statusStr === 'inactive') status = EmployeeStatusEnum.INACTIVE;

                    const newEmployee = new EmployeesEntity();
                    newEmployee.companyId = companyId;
                    // Add userId for creation tracking if needed by CommonBaseEntity, though strictly not required by Schema if nullable
                    newEmployee.userId = userId;
                    newEmployee.firstName = firstName;
                    newEmployee.lastName = lastName;
                    newEmployee.email = email;
                    newEmployee.phNumber = phone;
                    newEmployee.departmentId = resolvedDepartmentId!;
                    newEmployee.empStatus = status;
                    newEmployee.billingAmount = !isNaN(billingAmount) ? billingAmount : 0;
                    newEmployee.remarks = remarks;
                    newEmployee.createdAt = new Date();

                    await this.employeesRepo.save(newEmployee);
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
