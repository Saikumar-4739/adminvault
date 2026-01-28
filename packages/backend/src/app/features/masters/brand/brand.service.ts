import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BrandRepository } from './repositories/brand.repository';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateBrandModel, UpdateBrandModel, IdRequestModel, GetAllBrandsResponseModel } from '@adminvault/shared-models';
import { BrandsMasterEntity } from './entities/brand.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class BrandService {
    constructor(
        private dataSource: DataSource,
        private brandRepo: BrandRepository,
        private companyRepo: CompanyInfoRepository
    ) { }

    async createBrand(reqModel: CreateBrandModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const saveEnti = new BrandsMasterEntity();
            saveEnti.name = reqModel.name;
            saveEnti.description = reqModel.description;
            saveEnti.isActive = reqModel.isActive;
            saveEnti.website = reqModel.website;
            saveEnti.rating = reqModel.rating;
            saveEnti.code = reqModel.code;
            saveEnti.userId = reqModel.userId;
            await transManager.getRepository(BrandsMasterEntity).save(saveEnti);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, 'Brand created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAllBrands(): Promise<GetAllBrandsResponseModel> {
        try {
            const brands = await this.brandRepo.find();
            const brandsWithCompanyName = brands.map(brand => ({ id: brand.id, userId: brand.userId, createdAt: brand.createdAt, updatedAt: brand.updatedAt, name: brand.name, description: brand.description, isActive: brand.isActive, website: brand.website, rating: brand.rating, code: brand.code }));
            return new GetAllBrandsResponseModel(true, 200, 'Brands retrieved successfully', brandsWithCompanyName);
        } catch (error) {
            throw error;
        }
    }


    async updateBrand(reqModel: UpdateBrandModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.brandRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Brand not found');
            }

            await transManager.startTransaction();
            await transManager.getRepository(BrandsMasterEntity).update(reqModel.id, { name: reqModel.name, description: reqModel.description, isActive: reqModel.isActive, website: reqModel.website, rating: reqModel.rating, code: reqModel.code });
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Brand updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteBrand(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const delEntity = await this.brandRepo.findOne({ where: { id: reqModel.id } });
            if (!delEntity) {
                throw new ErrorResponse(404, 'Brand not found');
            }
            await transManager.startTransaction();
            await transManager.getRepository(BrandsMasterEntity).remove(delEntity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Brand deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
