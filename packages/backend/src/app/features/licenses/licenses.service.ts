
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
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
import { CompanyLicenseEntity } from './entities/company-license.entity';
import { CompanyInfoEntity } from '../masters/entities/company-info.entity';
import { ApplicationsMasterEntity } from '../masters/entities/application.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';

@Injectable()
export class LicensesService {
    constructor(
        @InjectRepository(CompanyLicenseEntity)
        private repo: Repository<CompanyLicenseEntity>
    ) { }

    /**
     * Retrieve all license assignments, optionally filtered by company
     * Fetches licenses with related company, application, and employee information manually
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

        if (licenses.length === 0) {
            return new GetAllLicensesModel(true, 200, 'Licenses retrieved successfully', []);
        }

        // Collect IDs for manual fetching
        const uniqueCompanyIds = [...new Set(licenses.map(l => l.companyId).filter(id => !!id))];
        const uniqueAppIds = [...new Set(licenses.map(l => l.applicationId).filter(id => !!id))];
        const uniqueEmpIds = [...new Set(licenses.map(l => l.assignedEmployeeId).filter(id => !!id))];

        // Fetch related entities using EntityManager
        const manager = this.repo.manager;

        const [companies, applications, employees] = await Promise.all([
            uniqueCompanyIds.length > 0 ? manager.getRepository(CompanyInfoEntity).find({ where: { id: In(uniqueCompanyIds) } }) : [],
            uniqueAppIds.length > 0 ? manager.getRepository(ApplicationsMasterEntity).find({ where: { id: In(uniqueAppIds) } }) : [],
            uniqueEmpIds.length > 0 ? manager.getRepository(EmployeesEntity).find({ where: { id: In(uniqueEmpIds) } }) : []
        ]);

        // Create Lookup Maps
        const companyMap = new Map<number, CompanyInfoEntity>(companies.map(c => [c.id, c] as [number, CompanyInfoEntity]));
        const appMap = new Map<number, ApplicationsMasterEntity>(applications.map(a => [a.id, a] as [number, ApplicationsMasterEntity]));
        const empMap = new Map<number, EmployeesEntity>(employees.map(e => [e.id, e] as [number, EmployeesEntity]));

        const licenseResponses = licenses.map(l => {
            const company = companyMap.get(l.companyId);
            const app = appMap.get(l.applicationId);
            const emp = l.assignedEmployeeId ? empMap.get(l.assignedEmployeeId) : undefined;

            return new LicenseResponseModel(
                l.id,
                l.companyId,
                l.applicationId,
                l.createdAt,
                l.updatedAt,
                l.assignedEmployeeId,
                undefined, // licenseKey
                undefined, // purchaseDate
                l.assignedDate,
                l.expiryDate,
                undefined, // seats
                l.remarks,
                company ? { id: company.id, companyName: company.companyName } : undefined,
                app ? { id: app.id, name: app.name, logo: '' } : undefined,
                emp ? { id: emp.id, firstName: emp.firstName, lastName: emp.lastName, avatar: emp.slackAvatar } : undefined
            );
        });

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


        return new GlobalResponse(true, 200, 'License removed successfully');
    }
}
