import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CompanyInfoRepository } from '../repositories/company-info.repository';
import { CompanyInfoEntity } from '../entities/company-info.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateCompanyModel, DeleteCompanyModel, GetCompanyModel, UpdateCompanyModel, CompanyDocs } from '@adminvault/shared-models';

@Injectable()
export class CompanyInfoService {
    constructor(
        private dataSource: DataSource,
        private companyInfoRepo: CompanyInfoRepository
    ) { }

    /**
     * Create a new company
     * Validates required fields and ensures company name uniqueness
     * 
     * @param reqModel - Company creation data
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if validation fails or company name already exists
     */
    async createCompany(reqModel: CreateCompanyModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.companyName || !reqModel.location || !reqModel.estDate) {
                throw new ErrorResponse(0, "Company name, Location and Establishment date are required");
            }

            const existingCompany = await this.companyInfoRepo.findOne({ where: { companyName: reqModel.companyName } });
            if (existingCompany) {
                throw new ErrorResponse(0, "Company with this name already exists");
            }

            await transManager.startTransaction();
            const newCompany = new CompanyInfoEntity();
            newCompany.companyName = reqModel.companyName;
            newCompany.location = reqModel.location;
            newCompany.estDate = reqModel.estDate;
            newCompany.email = reqModel.email && reqModel.email.trim() !== '' ? reqModel.email : null;
            newCompany.phone = reqModel.phone && reqModel.phone.trim() !== '' ? reqModel.phone : null;
            newCompany.userId = reqModel.userId;
            await transManager.getRepository(CompanyInfoEntity).save(newCompany);
            await transManager.completeTransaction();
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
    async updateCompany(reqModel: UpdateCompanyModel): Promise<GlobalResponse> {
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
            updateData.userId = reqModel.userId;
            if (reqModel.estDate) updateData.estDate = reqModel.estDate as any;
            if (reqModel.email !== undefined) {
                updateData.email = reqModel.email && reqModel.email.trim() !== '' ? reqModel.email : null;
            }
            if (reqModel.phone !== undefined) {
                updateData.phone = reqModel.phone && reqModel.phone.trim() !== '' ? reqModel.phone : null;
            }

            await transManager.getRepository(CompanyInfoEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();
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
     * Get all companies for dropdown (lightweight)
     * Returns only id and name for dropdown/select components
     * 
     * @returns GlobalResponse with array of {id, name} objects
     * @throws Error if retrieval fails
     */
    async getAllCompaniesDropdown(): Promise<GlobalResponse<{ id: number; name: string }[]>> {
        try {
            const companies = await this.companyInfoRepo.find({ select: ['id', 'companyName'] });
            const dropdownData = companies.map(company => ({ id: company.id, name: company.companyName }));
            return new GlobalResponse(true, 0, "Companies retrieved successfully", dropdownData);
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
    async deleteCompany(reqModel: DeleteCompanyModel): Promise<GlobalResponse> {
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
            return new GlobalResponse(true, 0, "Company deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
