import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { InfrastructureRepository } from './repositories/infrastructure.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateInfrastructureMasterModel, UpdateInfrastructureMasterModel, GetAllInfrastructureMasterResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { InfrastructureMasterEntity } from './entities/infrastructure.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class InfrastructureService {
    constructor(
        private dataSource: DataSource,
        private infraRepo: InfrastructureRepository
    ) { }

    async createInfrastructure(reqModel: CreateInfrastructureMasterModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.deviceName) {
                throw new ErrorResponse(0, "Device Name is required");
            }

            const existingSerial = await this.infraRepo.findOne({ where: { serialNumber: reqModel.serialNumber } });
            if (existingSerial) {
                throw new ErrorResponse(0, "Infrastructure with this Serial Number already exists");
            }

            await transManager.startTransaction();
            const newInfra = new InfrastructureMasterEntity();
            newInfra.userId = reqModel.createdBy; // Map createdBy from model to userId in entity
            newInfra.device = reqModel.deviceName;
            newInfra.serialNumber = reqModel.serialNumber;
            newInfra.description = reqModel.description;
            newInfra.isActive = reqModel.isActive ?? true;

            if (reqModel.purchaseDate) {
                const pDate = new Date(reqModel.purchaseDate);
                if (!isNaN(pDate.getTime())) {
                    newInfra.purchaseDate = pDate;
                }
            }

            await transManager.getRepository(InfrastructureMasterEntity).save(newInfra);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, 'Infrastructure created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getInfrastructure(reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            const infra = await this.infraRepo.findOne({ where: { id: reqModel.id } });
            if (!infra) {
                throw new ErrorResponse(404, 'Infrastructure not found');
            }
            return new GlobalResponse(true, 200, 'Infrastructure retrieved successfully', infra);
        } catch (error) {
            throw error;
        }
    }

    async getAllInfrastructure(): Promise<GetAllInfrastructureMasterResponseModel> {
        try {
            const infraList = await this.infraRepo.find();
            const mappedList = infraList.map(infra => ({
                id: infra.id,
                companyId: 0, // Default or fetch from somewhere if needed
                deviceName: infra.device,
                serialNumber: infra.serialNumber,
                description: infra.description,
                purchaseDate: infra.purchaseDate,
                isActive: infra.isActive,
                createdBy: infra.userId,
                createdAt: infra.createdAt,
                updatedAt: infra.updatedAt
            }));
            return new GetAllInfrastructureMasterResponseModel(true, 200, 'Infrastructure retrieved successfully', mappedList);
        } catch (error) {
            throw error;
        }
    }

    async updateInfrastructure(reqModel: UpdateInfrastructureMasterModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.infraRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Infrastructure not found');
            }

            if (reqModel.deviceName !== undefined && reqModel.deviceName.trim() === '') {
                throw new ErrorResponse(0, 'Device Name cannot be empty');
            }

            // Check uniqueness of serial only if it's being updated
            if (reqModel.serialNumber) {
                const existingSerial = await this.infraRepo.findOne({ where: { serialNumber: reqModel.serialNumber, id: Not(reqModel.id) } });
                if (existingSerial) {
                    throw new ErrorResponse(0, "Infrastructure with this Serial Number already exists");
                }
            }

            await transManager.startTransaction();
            const updateData: Partial<InfrastructureMasterEntity> = {
                device: reqModel.deviceName,
                serialNumber: reqModel.serialNumber,
                description: reqModel.description,
                isActive: reqModel.isActive,
                purchaseDate: reqModel.purchaseDate ? new Date(reqModel.purchaseDate) : undefined
            };

            await transManager.getRepository(InfrastructureMasterEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Infrastructure updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteInfrastructure(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(InfrastructureMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Infrastructure deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
