
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

@Injectable()
export class LicensesService {
    constructor(
        @InjectRepository(CompanyLicenseEntity)
        private repo: Repository<CompanyLicenseEntity>
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
            .leftJoinAndSelect('license.company', 'company')
            .leftJoinAndSelect('license.application', 'application')
            .leftJoinAndSelect('license.assignedEmployee', 'assignedEmployee')
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
            undefined, // licenseKey - not in entity
            undefined, // purchaseDate - not in entity
            l.expiryDate,
            undefined, // seats - not in entity
            l.remarks // notes mapped to remarks
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
    async create(reqModel: CreateLicenseModel): Promise<GlobalResponse> {
        const licenseData: Partial<CompanyLicenseEntity> = {
            companyId: reqModel.companyId,
            applicationId: reqModel.applicationId,
            assignedEmployeeId: reqModel.assignedEmployeeId,
            expiryDate: reqModel.expiryDate,
            remarks: reqModel.notes
        };

        const license = this.repo.create(licenseData);
        await this.repo.save(license);
        return new GlobalResponse(true, 201, 'License assigned successfully');
    }

    /**
     * Update an existing license assignment
     * Modifies license details such as expiry date or assigned employee
     * 
     * @param reqModel - License update data with ID
     * @returns GlobalResponse indicating update success
     */
    async update(reqModel: UpdateLicenseModel): Promise<GlobalResponse> {
        const updateData: Partial<CompanyLicenseEntity> = {
            applicationId: reqModel.applicationId,
            assignedEmployeeId: reqModel.assignedEmployeeId,
            expiryDate: reqModel.expiryDate,
            remarks: reqModel.notes
        };

        await this.repo.update(reqModel.id, updateData);
        return new GlobalResponse(true, 200, 'License updated successfully');
    }

    /**
     * Remove a license assignment
     * Permanently deletes license assignment from database
     * 
     * @param reqModel - Delete request with license ID
     * @returns GlobalResponse indicating deletion success
     */
    async remove(reqModel: DeleteLicenseModel): Promise<GlobalResponse> {
        await this.repo.delete(reqModel.id);
        return new GlobalResponse(true, 200, 'License removed successfully');
    }
}
