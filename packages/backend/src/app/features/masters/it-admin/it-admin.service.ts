import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ItAdminRepository } from '../../../repository/it-admin.repository';
import { ItAdminEntity } from '../../../entities/it-admin.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateItAdminModel, UpdateItAdminModel, DeleteItAdminModel, GetItAdminModel, GetAllItAdminsModel, GetItAdminByIdModel, ItAdminResponseModel } from '@adminvault/shared-models';

@Injectable()
export class ItAdminService {
    constructor(
        private dataSource: DataSource,
        private itAdminRepo: ItAdminRepository
    ) { }

    async createAdmin(reqModel: CreateItAdminModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.adminCode) {
                throw new ErrorResponse(0, "Admin code is required");
            }
            if (!reqModel.name) {
                throw new ErrorResponse(0, "Name is required");
            }
            if (!reqModel.email) {
                throw new ErrorResponse(0, "Email is required");
            }
            if (!reqModel.roleEnum) {
                throw new ErrorResponse(0, "Role is required");
            }

            const existing = await this.itAdminRepo.findOne({ where: { email: reqModel.email } });
            if (existing) {
                throw new ErrorResponse(0, "Email already exists");
            }

            await transManager.startTransaction();
            const entity = this.itAdminRepo.create(reqModel);
            await transManager.getRepository(ItAdminEntity).save(entity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "IT Admin created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateAdmin(reqModel: UpdateItAdminModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Admin ID is required");
            }
            const existing = await this.itAdminRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "IT Admin not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(ItAdminEntity).update(reqModel.id, reqModel);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "IT Admin updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAdmin(reqModel: GetItAdminModel): Promise<GetItAdminByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Admin ID is required");
            }
            const admin = await this.itAdminRepo.findOne({ where: { id: reqModel.id } });
            if (!admin) {
                throw new ErrorResponse(0, "IT Admin not found");
            }

            const response = new ItAdminResponseModel(
                admin.id, admin.adminCode, admin.name, admin.email,
                admin.roleEnum, admin.status, admin.phNumber, admin.permissions
            );
            return new GetItAdminByIdModel(true, 0, "IT Admin retrieved successfully", response);
        } catch (error) {
            throw error;
        }
    }

    async getAllAdmins(): Promise<GetAllItAdminsModel> {
        try {
            const admins = await this.itAdminRepo.find();
            const responses = admins.map(a => new ItAdminResponseModel(a.id, a.adminCode, a.name, a.email, a.roleEnum, a.status, a.phNumber, a.permissions));
            return new GetAllItAdminsModel(true, 0, "IT Admins retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    async deleteAdmin(reqModel: DeleteItAdminModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Admin ID is required");
            }
            const existing = await this.itAdminRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "IT Admin not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(ItAdminEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "IT Admin deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
