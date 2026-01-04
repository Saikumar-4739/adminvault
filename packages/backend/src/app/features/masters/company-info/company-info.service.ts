import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CompanyInfoRepository } from '../../../repository/company-info.repository';
import { CompanyInfoEntity } from '../../../entities/company-info.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateCompanyModel, DeleteCompanyModel, GetCompanyModel, UpdateCompanyModel, CompanyDocs } from '@adminvault/shared-models';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

@Injectable()
export class CompanyInfoService {
    constructor(
        private dataSource: DataSource,
        private companyInfoRepo: CompanyInfoRepository,
        private auditLogsService: AuditLogsService
    ) { }

    /**
     * Create a new company
     * Validates required fields and ensures company name uniqueness
     * 
     * @param reqModel - Company creation data
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if validation fails or company name already exists
     */
    async createCompany(reqModel: CreateCompanyModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.companyName) {
                throw new ErrorResponse(0, "Company name is required");
            }

            if (!reqModel.location) {
                throw new ErrorResponse(0, "Location is required");
            }

            if (!reqModel.estDate) {
                throw new ErrorResponse(0, "Establishment date is required");
            }

            const existingCompany = await this.companyInfoRepo.findOne({ where: { companyName: reqModel.companyName } });
            if (existingCompany) {
                throw new ErrorResponse(0, "Company with this name already exists");
            }

            await transManager.startTransaction();
            const newCompany = new CompanyInfoEntity();
            newCompany.companyName = reqModel.companyName;
            newCompany.location = reqModel.location;
            newCompany.estDate = reqModel.estDate as any;
            newCompany.email = reqModel.email && reqModel.email.trim() !== '' ? reqModel.email : null;
            newCompany.phone = reqModel.phone && reqModel.phone.trim() !== '' ? reqModel.phone : null;
            const savedCompany = await transManager.getRepository(CompanyInfoEntity).save(newCompany);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'CREATE_COMPANY',
                resource: 'CompanyInfo',
                details: `Company ${savedCompany.companyName} created`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: savedCompany.id,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Company created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Update an existing company
     * Modifies company information for an existing company record
     * 
     * @param reqModel - Company update data
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if company not found or update fails
     */
    async updateCompany(reqModel: UpdateCompanyModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            const existingCompany = await this.companyInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingCompany) {
                throw new ErrorResponse(0, "Company not found");
            }

            await transManager.startTransaction();
            const updateData: Partial<CompanyInfoEntity> = {};
            updateData.companyName = reqModel.companyName;
            updateData.location = reqModel.location;
            if (reqModel.estDate) updateData.estDate = reqModel.estDate as any;
            if (reqModel.email !== undefined) {
                updateData.email = reqModel.email && reqModel.email.trim() !== '' ? reqModel.email : null;
            }
            if (reqModel.phone !== undefined) {
                updateData.phone = reqModel.phone && reqModel.phone.trim() !== '' ? reqModel.phone : null;
            }

            await transManager.getRepository(CompanyInfoEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'UPDATE_COMPANY',
                resource: 'CompanyInfo',
                details: `Company ${existingCompany.companyName} updated`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: existingCompany.id,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Company updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Get a specific company by ID
     * Retrieves detailed information about a single company
     * 
     * @param reqModel - Request model containing company ID
     * @returns GlobalResponse with company data
     * @throws ErrorResponse if company not found
     */
    async getCompany(reqModel: GetCompanyModel): Promise<GlobalResponse> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            const company = await this.companyInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!company) {
                throw new ErrorResponse(0, "Company not found");
            }
            const companyDoc = new CompanyDocs(company.id, company.companyName, company.location, company.estDate as any, company.email, company.phone);
            return new GlobalResponse(true, 0, "Company retrieved successfully", companyDoc);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all companies in the system
     * Retrieves a list of all registered companies
     * 
     * @returns GlobalResponse with array of company documents
     * @throws Error if retrieval fails
     */
    async getAllCompanies(): Promise<GlobalResponse<CompanyDocs[]>> {
        try {
            const companies = await this.companyInfoRepo.find();
            const companyDocs = companies.map(company => new CompanyDocs(company.id, company.companyName, company.location, company.estDate as any, company.email, company.phone));
            return new GlobalResponse(true, 0, "Companies retrieved successfully", companyDocs);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a company (hard delete)
     * Permanently removes a company from the database
     * Note: This is a hard delete, not a soft delete
     * 
     * @param reqModel - Request model containing company ID to delete
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if company not found or deletion fails
     */
    async deleteCompany(reqModel: DeleteCompanyModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            const existingCompany = await this.companyInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingCompany) {
                throw new ErrorResponse(0, "Company not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(CompanyInfoEntity).delete(reqModel.id);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'DELETE_COMPANY',
                resource: 'CompanyInfo',
                details: `Company ${existingCompany.companyName} deleted`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: existingCompany.id,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Company deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
