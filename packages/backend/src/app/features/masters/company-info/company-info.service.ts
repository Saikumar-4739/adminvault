import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CompanyResponse, CompanyResponseModel, CreateCompanyModel, DeleteCompanyModel, GetCompanyModel, UpdateCompanyModel, CompanyDropdownResponse, CompanyDropdownModel } from '@adminvault/shared-models';
import { CompanyInfoEntity } from './entities/company-info.entity';
import { CompanyInfoRepository } from './repositories/company-info.repository';

@Injectable()
export class CompanyInfoService {
    constructor(
        private dataSource: DataSource,
        private companyInfoRepo: CompanyInfoRepository
    ) { }

    /**
     * Create a new company
     * Validates required fields and ensures company name uniqueness
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

            if (reqModel.email) {
                const emailExists = await this.companyInfoRepo.findOne({ where: { email: reqModel.email } });
                if (emailExists) {
                    throw new ErrorResponse(0, 'Email already in use');
                }
            }

            if (reqModel.phone) {
                const phoneExists = await this.companyInfoRepo.findOne({ where: { phone: reqModel.phone } });
                if (phoneExists) {
                    throw new ErrorResponse(0, 'Phone number already in use');
                }
            }

            await transManager.startTransaction();
            const newCompany = new CompanyInfoEntity();
            newCompany.companyName = reqModel.companyName;
            newCompany.location = reqModel.location;
            newCompany.estDate = reqModel.estDate;
            newCompany.email = reqModel.email;
            newCompany.phone = reqModel.phone;
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
     */
    async updateCompany(reqModel: UpdateCompanyModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);

        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, 'Company ID is required');
            }

            const existingCompany = await this.companyInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingCompany) {
                throw new ErrorResponse(0, 'Company not found');
            }

            if (reqModel.companyName !== undefined && reqModel.companyName.trim() === '') {
                throw new ErrorResponse(0, 'Company name cannot be empty');
            }

            if (reqModel.email) {
                const emailExists = await this.companyInfoRepo.findOne({ where: { email: reqModel.email, id: Not(reqModel.id) } });
                if (emailExists) {
                    throw new ErrorResponse(0, 'Email already in use');
                }
            }

            if (reqModel.phone) {
                const phoneExists = await this.companyInfoRepo.findOne({ where: { phone: reqModel.phone, id: Not(reqModel.id) } });
                if (phoneExists) {
                    throw new ErrorResponse(0, 'Phone number already in use');
                }
            }

            await transManager.startTransaction();
            const updateData: Partial<CompanyInfoEntity> = {};
            if (Object.keys(updateData).length === 0) {
                throw new ErrorResponse(0, 'No valid fields provided for update');
            }

            await transManager.getRepository(CompanyInfoEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, 'Company updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }


    /**
     * Get a specific company by ID
     * Retrieves detailed information about a single company
     *
     */
    async getCompany(reqModel: GetCompanyModel): Promise<CompanyResponse> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            const company = await this.companyInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!company) {
                throw new ErrorResponse(0, "Company not found");
            }

            const companyDoc = new CompanyResponseModel(company.id, company.companyName, company.location, company.estDate as any, company.email, company.phone);
            return new CompanyResponse(true, 0, "Company retrieved successfully", [companyDoc]);
        } catch (error) {
            throw error;
        }
    }


    /**
     * Get all companies in the system
     * Retrieves a list of all registered companies
     */
    async getAllCompanies(): Promise<CompanyResponse> {
        try {
            const companies = await this.companyInfoRepo.find();
            const companyDocs = companies.map(company => new CompanyResponseModel(company.id, company.companyName, company.location, company.estDate, company.email, company.phone));
            return new CompanyResponse(true, 0, "Companies retrieved successfully", companyDocs);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all companies for dropdown (lightweight)
     * Returns only id and name for dropdown/select components
     */
    async getAllCompaniesDropdown(): Promise<CompanyDropdownResponse> {
        try {
            const companies = await this.companyInfoRepo.find({ select: ['id', 'companyName'] });
            const dropdownData = companies.map(company => new CompanyDropdownModel(company.id, company.companyName));
            return new CompanyDropdownResponse(true, 0, "Companies retrieved successfully", dropdownData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a company (hard delete)
     * Permanently removes a company from the database
     * Note: This is a hard delete, not a soft delete
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
