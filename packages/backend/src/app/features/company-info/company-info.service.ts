import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CompanyInfoRepository } from '../../repository/company-info.repository';
import { CompanyInfoEntity } from '../../entities/company-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateCompanyModel, DeleteCompanyModel, GetCompanyModel, UpdateCompanyModel } from '@adminvault/shared-models';

@Injectable()
export class CompanyInfoService {
    constructor(
        private dataSource: DataSource,
        private companyInfoRepo: CompanyInfoRepository
    ) { }

    async createCompany(reqModel: CreateCompanyModel): Promise<GlobalResponse> {
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

            // Check if company with same name already exists
            const existingCompany = await this.companyInfoRepo.findOne({
                where: { companyName: reqModel.companyName }
            });

            if (existingCompany) {
                throw new ErrorResponse(0, "Company with this name already exists");
            }

            await transManager.startTransaction();
            const newCompany = new CompanyInfoEntity();
            newCompany.companyName = reqModel.companyName;
            newCompany.location = reqModel.location;
            newCompany.estDate = reqModel.estDate;

            await transManager.getRepository(CompanyInfoEntity).save(newCompany);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 0, "Company created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateCompany(reqModel: UpdateCompanyModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            // Check if company exists
            const existingCompany = await this.companyInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingCompany) {
                throw new ErrorResponse(0, "Company not found");
            }

            await transManager.startTransaction();
            const updateData: Partial<CompanyInfoEntity> = {};
            if (reqModel.companyName) updateData.companyName = reqModel.companyName;
            if (reqModel.location) updateData.location = reqModel.location;
            if (reqModel.estDate) updateData.estDate = reqModel.estDate;

            await transManager.getRepository(CompanyInfoEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 0, "Company updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getCompany(reqModel: GetCompanyModel): Promise<GlobalResponse> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Company ID is required");
            }
            const company = await this.companyInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!company) {
                throw new ErrorResponse(0, "Company not found");
            }
            return new GlobalResponse(true, 0, "Company retrieved successfully");
        } catch (error) {
            throw error;
        }
    }

    async getAllCompanies(): Promise<GlobalResponse> {
        try {
            const companies = await this.companyInfoRepo.find();
            return new GlobalResponse(true, 0, "Companies retrieved successfully");
        } catch (error) {
            throw error;
        }
    }

    async deleteCompany(reqModel: DeleteCompanyModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            // Check if company exists
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
