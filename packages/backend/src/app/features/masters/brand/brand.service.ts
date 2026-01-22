import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BrandRepository } from './repositories/brand.repository';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateBrandModel, UpdateBrandModel, GetAllBrandsResponseModel, CreateBrandResponseModel, UpdateBrandResponseModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { BrandsMasterEntity } from './entities/brand.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class BrandService {
    constructor(
        private dataSource: DataSource,
        private brandRepo: BrandRepository,
        private companyRepo: CompanyInfoRepository
    ) { }

    async getAllBrands(reqModel: CompanyIdRequestModel): Promise<GetAllBrandsResponseModel> {
        try {
            const brands = await this.brandRepo.find();
            const company = await this.companyRepo.findOne({ where: { id: reqModel.companyId } });
            const brandsWithCompanyName = brands.map(brand => ({
                id: brand.id,
                userId: brand.userId,
                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt,
                name: brand.name,
                description: brand.description,
                isActive: brand.isActive,
                website: brand.website,
                rating: brand.rating,
                code: brand.code,
                companyName: company?.companyName
            }));
            return new GetAllBrandsResponseModel(true, 200, 'Brands retrieved successfully', brandsWithCompanyName);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Brands');
        }
    }

    async createBrand(data: CreateBrandModel, userId?: number, ipAddress?: string): Promise<CreateBrandResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandsMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();

            return new CreateBrandResponseModel(true, 201, 'Brand created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Brand');
        }
    }

    async updateBrand(data: UpdateBrandModel, userId?: number, ipAddress?: string): Promise<UpdateBrandResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.brandRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Brand not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandsMasterEntity);
            await repo.save({
                id: data.id,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                website: data.website,
                rating: data.rating,
                code: data.code,
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated brand');
            }
            await transManager.completeTransaction();

            return new UpdateBrandResponseModel(true, 200, 'Brand updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Brand');
        }
    }

    async deleteBrand(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Brand deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Brand');
        }
    }
}
