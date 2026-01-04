
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyLicenseEntity } from '../../entities/company-license.entity';
import { GlobalResponse } from '@adminvault/backend-utils';
import {
    CreateLicenseModel,
    UpdateLicenseModel,
    DeleteLicenseModel,
    GetAllLicensesModel,
    GetLicenseStatsModel,
    LicenseStatsModel,
    LicenseResponseModel
} from '@adminvault/shared-models';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class LicensesService {
    constructor(
        @InjectRepository(CompanyLicenseEntity)
        private repo: Repository<CompanyLicenseEntity>,
        private auditLogsService: AuditLogsService
    ) { }

    /**
     * Retrieve all license assignments, optionally filtered by company
     * Fetches licenses with related company, application, and employee information
     * 
     * @param companyId - Optional company ID to filter licenses
     * @returns GetAllLicensesModel with array of license data including relations
     */
    async findAll(companyId?: number): Promise<GetAllLicensesModel> {
        const query = this.repo.createQueryBuilder('license')
            .orderBy('license.createdAt', 'DESC');

        if (companyId) {
            query.where('license.companyId = :companyId', { companyId });
        }

        const licenses = await query.getMany();

        const licenseResponses = licenses.map(l => new LicenseResponseModel(
            l.id,
            l.companyId,
            l.applicationId,
            l.createdAt,
            l.updatedAt,
            l.assignedEmployeeId,
            undefined, // licenseKey
            undefined, // purchaseDate
            l.expiryDate,
            undefined, // seats
            l.remarks,
            undefined, // company (removed relation)
            undefined, // application (removed relation)
            undefined  // assignedEmployee (removed relation)
        ));

        return new GetAllLicensesModel(true, 200, 'Licenses retrieved successfully', licenseResponses);
    }

    /**
     * Calculate license statistics for dashboard
     * Computes total licenses, used licenses, and licenses expiring within 30 days
     * 
     * @param companyId - Optional company ID to filter statistics
     * @returns GetLicenseStatsModel with license statistics
     */
    async getStats(companyId?: number): Promise<GetLicenseStatsModel> {
        const query = this.repo.createQueryBuilder('license');

        if (companyId) {
            query.where('license.companyId = :companyId', { companyId });
        }

        const licenses = await query.getMany();

        const total = licenses.length;
        const used = total;
        const totalCost = 0;

        // Expiring in 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSoon = licenses.filter(l =>
            l.expiryDate && new Date(l.expiryDate) <= thirtyDaysFromNow && new Date(l.expiryDate) >= new Date()
        ).length;

        const stats = new LicenseStatsModel(total, used, totalCost, expiringSoon);
        return new GetLicenseStatsModel(true, 200, 'License statistics retrieved successfully', stats);
    }

    /**
     * Create a new license assignment
     * Assigns a software license to an employee
     * 
     * @param reqModel - License assignment creation data
     * @returns GlobalResponse indicating creation success
     */
    async create(reqModel: CreateLicenseModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const licenseData: Partial<CompanyLicenseEntity> = {
            companyId: reqModel.companyId,
            applicationId: reqModel.applicationId,
            assignedEmployeeId: reqModel.assignedEmployeeId,
            assignedDate: reqModel.assignedDate || null,
            expiryDate: reqModel.expiryDate || null,
            remarks: reqModel.remarks || null
        };

        const license = this.repo.create(licenseData);
        await this.repo.save(license);

        // AUDIT LOG
        await this.auditLogsService.create({
            action: 'CREATE_LICENSE',
            resource: 'License',
            details: `License assigned to Employee ${reqModel.assignedEmployeeId} for App ${reqModel.applicationId}`,
            status: 'SUCCESS',
            userId: userId || undefined,
            companyId: reqModel.companyId,
            ipAddress: ipAddress || '0.0.0.0'
        });

        return new GlobalResponse(true, 201, 'License assigned successfully');
    }

    /**
     * Update an existing license assignment
     * Modifies license details such as expiry date or assigned employee
     * 
     * @param reqModel - License update data with ID
     * @returns GlobalResponse indicating update success
     */
    async update(reqModel: UpdateLicenseModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const updateData: Partial<CompanyLicenseEntity> = {
            applicationId: reqModel.applicationId,
            assignedEmployeeId: reqModel.assignedEmployeeId,
            assignedDate: reqModel.assignedDate || null,
            expiryDate: reqModel.expiryDate || null,
            remarks: reqModel.remarks || null
        };

        await this.repo.update(reqModel.id, updateData);

        // AUDIT LOG
        await this.auditLogsService.create({
            action: 'UPDATE_LICENSE',
            resource: 'License',
            details: `License ${reqModel.id} updated`,
            status: 'SUCCESS',
            userId: userId || undefined,
            companyId: 0,
            ipAddress: ipAddress || '0.0.0.0'
        });

        return new GlobalResponse(true, 200, 'License updated successfully');
    }

    /**
     * Remove a license assignment
     * Permanently deletes license assignment from database
     * 
     * @param reqModel - Delete request with license ID
     * @returns GlobalResponse indicating deletion success
     */
    async remove(reqModel: DeleteLicenseModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        await this.repo.delete(reqModel.id);

        // AUDIT LOG
        await this.auditLogsService.create({
            action: 'DELETE_LICENSE',
            resource: 'License',
            details: `License ${reqModel.id} deleted`,
            status: 'SUCCESS',
            userId: userId || undefined,
            companyId: 0,
            ipAddress: ipAddress || '0.0.0.0'
        });

        return new GlobalResponse(true, 200, 'License removed successfully');
    }
}
