import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateDeviceModel, UpdateDeviceModel, DeleteDeviceModel, GetDeviceModel, GetAllDevicesModel, GetDeviceByIdModel, DeviceResponseModel } from '@adminvault/shared-models';
import { DeviceInfoEntity } from './entities/device-info.entity';
import { DeviceInfoRepository } from './repositories/device-info.repository';

@Injectable()
export class DeviceInfoService {
    constructor(
        private dataSource: DataSource,
        private deviceInfoRepo: DeviceInfoRepository
    ) { }

    async createDevice(reqModel: CreateDeviceModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.deviceId) {
                throw new ErrorResponse(0, "Device ID is required");
            }

            const existing = await this.deviceInfoRepo.findOne({ where: { deviceId: reqModel.deviceId } });
            if (existing) {
                throw new ErrorResponse(0, "Device ID already exists");
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DeviceInfoEntity);
            const { id, companyId, userId, ...createData } = reqModel;
            const newItem = repo.create(createData);
            await repo.save(newItem);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, "Device created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateDevice(reqModel: UpdateDeviceModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Device ID/Primary Key is required");
            }

            const existing = await this.deviceInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, "Device not found");
            }

            if (reqModel.deviceId) {
                const existingCode = await this.deviceInfoRepo.findOne({ where: { deviceId: reqModel.deviceId, id: Not(reqModel.id) } });
                if (existingCode) {
                    throw new ErrorResponse(0, "Device ID already in use");
                }
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DeviceInfoEntity);
            await repo.save({
                id: reqModel.id,
                deviceId: reqModel.deviceId,
                deviceType: reqModel.deviceType,
                deviceName: reqModel.deviceName,
                model: reqModel.model,
                brandName: reqModel.brandName,
                servicesTag: reqModel.servicesTag,
                configuration: reqModel.configuration,
                assetTypeId: reqModel.assetTypeId
            });
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, "Device updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Device');
        }
    }

    async getDevice(reqModel: GetDeviceModel): Promise<GetDeviceByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Device ID is required");
            }

            const device = await this.deviceInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!device) {
                throw new ErrorResponse(404, "Device not found");
            }

            const deviceResponse = new DeviceResponseModel(device.id, device.deviceType, device.deviceName, device.model, device.brandName, device.servicesTag, device.configuration);
            return new GetDeviceByIdModel(true, 200, "Device retrieved successfully", deviceResponse);
        } catch (error) {
            throw error;
        }
    }

    async getAllDevices(): Promise<GetAllDevicesModel> {
        try {
            const devices = await this.deviceInfoRepo.find();
            const deviceResponses = devices.map(device => new DeviceResponseModel(device.id, device.deviceType, device.deviceName, device.model, device.brandName, device.servicesTag, device.configuration));
            return new GetAllDevicesModel(true, 200, "Devices retrieved successfully", deviceResponses);
        } catch (error) {
            throw new ErrorResponse(500, "Failed to fetch Devices");
        }
    }

    async deleteDevice(reqModel: DeleteDeviceModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Device ID is required");
            }

            const existing = await this.deviceInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, "Device not found");
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DeviceInfoEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, "Device deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Device');
        }
    }
}
