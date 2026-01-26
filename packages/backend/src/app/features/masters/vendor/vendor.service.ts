import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { VendorRepository } from './repositories/vendor.repository';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateVendorModel, UpdateVendorModel, GetAllVendorsResponseModel, CreateVendorResponseModel, UpdateVendorResponseModel, CompanyIdRequestModel, IdRequestModel } from '@adminvault/shared-models';
import { VendorsMasterEntity } from './entities/vendor.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class VendorService {
    constructor(
        private dataSource: DataSource,
        private vendorRepo: VendorRepository,
        private companyRepo: CompanyInfoRepository
    ) { }

    async getAllVendors(reqModel: CompanyIdRequestModel): Promise<GetAllVendorsResponseModel> {
        try {
            const vendors = await this.vendorRepo.find();
            const company = await this.companyRepo.findOne({ where: { id: reqModel.companyId } });
            const vendorsWithCompanyName = vendors.map(vendor => ({
                id: vendor.id,
                userId: vendor.userId,
                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,
                name: vendor.name,
                description: vendor.description,
                isActive: vendor.isActive,
                contactPerson: vendor.contactPerson,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address,
                code: vendor.code,
                companyName: company?.companyName
            }));
            return new GetAllVendorsResponseModel(true, 200, 'Vendors retrieved successfully', vendorsWithCompanyName);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Vendors');
        }
    }

    async createVendor(data: CreateVendorModel, userId?: number, ipAddress?: string): Promise<CreateVendorResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorsMasterEntity);
            const { companyId, ...createData } = data;
            if (!data.name) {
                throw new ErrorResponse(0, "Vendor name is required");
            }

            const existingName = await repo.findOne({ where: { name: data.name } });
            if (existingName) {
                throw new ErrorResponse(0, "Vendor with this name already exists");
            }

            if (createData.code) {
                const existingCode = await repo.findOne({ where: { code: createData.code } });
                if (existingCode) {
                    throw new ErrorResponse(0, "Vendor code already in use");
                }
            }

            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();

            return new CreateVendorResponseModel(true, 201, 'Vendor created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Vendor');
        }
    }

    async updateVendor(data: UpdateVendorModel, userId?: number, ipAddress?: string): Promise<UpdateVendorResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.vendorRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Vendor not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorsMasterEntity);
            if (data.name !== undefined && data.name.trim() === '') {
                throw new ErrorResponse(0, 'Vendor name cannot be empty');
            }

            if (data.code) {
                const codeExists = await this.vendorRepo.findOne({ where: { code: data.code, id: Not(data.id) } });
                if (codeExists) {
                    throw new ErrorResponse(0, 'Vendor code already in use');
                }
            }

            await repo.save({
                id: data.id,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                contactPerson: data.contactPerson,
                email: data.email,
                phone: data.phone,
                address: data.address,
                code: data.code,
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated vendor');
            }
            await transManager.completeTransaction();

            return new UpdateVendorResponseModel(true, 200, 'Vendor updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Vendor');
        }
    }

    async deleteVendor(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Vendor deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Vendor');
        }
    }
}
