import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VendorRepository } from './repositories/vendor.repository';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateVendorModel, UpdateVendorModel, GetAllVendorsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { VendorsMasterEntity } from './entities/vendor.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class VendorService {
    constructor(
        private dataSource: DataSource,
        private vendorRepo: VendorRepository,
        private companyRepo: CompanyInfoRepository
    ) { }

    async createVendor(reqModel: CreateVendorModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {

            const existingName = await this.vendorRepo.findOne({ where: { name: reqModel.name } });
            if (existingName) {
                throw new ErrorResponse(0, "Vendor with this name already exists");
            }

            const existingCode = await this.vendorRepo.findOne({ where: { code: reqModel.code } });
            if (existingCode) {
                throw new ErrorResponse(0, "Vendor code already in use");
            }

            await transManager.startTransaction();
            const saveEntity = new VendorsMasterEntity();
            saveEntity.name = reqModel.name;
            saveEntity.description = reqModel.description;
            saveEntity.isActive = reqModel.isActive;
            saveEntity.contactPerson = reqModel.contactPerson;
            saveEntity.email = reqModel.email;
            saveEntity.phone = reqModel.phone;
            saveEntity.address = reqModel.address;
            saveEntity.code = reqModel.code;
            saveEntity.userId = reqModel.userId;
            await transManager.getRepository(VendorsMasterEntity).save(saveEntity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, 'Vendor created successfully', saveEntity);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAllVendors(): Promise<GetAllVendorsResponseModel> {
        try {
            const vendors = await this.vendorRepo.find();
            const vendorsWithCompanyName = vendors.map(vendor => ({ id: vendor.id, userId: vendor.userId, createdAt: vendor.createdAt, updatedAt: vendor.updatedAt, name: vendor.name, description: vendor.description, isActive: vendor.isActive, contactPerson: vendor.contactPerson, email: vendor.email, phone: vendor.phone, address: vendor.address, code: vendor.code, }));
            return new GetAllVendorsResponseModel(true, 200, 'Vendors retrieved successfully', vendorsWithCompanyName);
        } catch (error) {
            throw error;
        }
    }

    async updateVendor(reqModel: UpdateVendorModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.vendorRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Vendor not found');
            }

            await transManager.startTransaction();
            await transManager.getRepository(VendorsMasterEntity).update(reqModel.id, { name: reqModel.name, description: reqModel.description, isActive: reqModel.isActive, contactPerson: reqModel.contactPerson, email: reqModel.email, phone: reqModel.phone, address: reqModel.address, code: reqModel.code, });
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Vendor updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteVendor(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            await transManager.getRepository(VendorsMasterEntity).delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Vendor deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
