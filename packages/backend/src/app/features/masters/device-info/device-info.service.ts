import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeviceInfoRepository } from '../repositories/device-info.repository';
import { DeviceInfoEntity } from '../entities/device-info.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateDeviceModel, UpdateDeviceModel, DeleteDeviceModel, GetDeviceModel, GetAllDevicesModel, GetDeviceByIdModel, DeviceResponseModel } from '@adminvault/shared-models';

@Injectable()
export class DeviceInfoService {
    constructor(
        private dataSource: DataSource,
        private deviceInfoRepo: DeviceInfoRepository
    ) { }

    async createDevice(reqModel: CreateDeviceModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.deviceType) {
                throw new ErrorResponse(0, "Device type is required");
            }
            if (!reqModel.deviceName) {
                throw new ErrorResponse(0, "Device name is required");
            }

            await transManager.startTransaction();
            const newDevice = new DeviceInfoEntity();
            newDevice.deviceType = reqModel.deviceType;
            newDevice.deviceName = reqModel.deviceName;
            const savedDevice = await transManager.getRepository(DeviceInfoEntity).save(newDevice);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'CREATE_DEVICE',
                resource: 'DeviceInfo',
                details: `Device ${savedDevice.deviceName} created`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: 0,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Device created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateDevice(reqModel: UpdateDeviceModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Device ID is required");
            }

            // Check if device exists
            const existingDevice = await this.deviceInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingDevice) {
                throw new ErrorResponse(0, "Device not found");
            }

            await transManager.startTransaction();
            const updateData: Partial<DeviceInfoEntity> = {};
            updateData.deviceType = reqModel.deviceType;
            updateData.deviceName = reqModel.deviceName;
            updateData.model = reqModel.model;
            updateData.brandName = reqModel.brandName;
            updateData.servicesTag = reqModel.servicesTag;
            updateData.configuration = reqModel.configuration;
            await transManager.getRepository(DeviceInfoEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'UPDATE_DEVICE',
                resource: 'DeviceInfo',
                details: `Device ${existingDevice.deviceName} updated`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: 0,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Device updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getDevice(reqModel: GetDeviceModel): Promise<GetDeviceByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Device ID is required");
            }

            const device = await this.deviceInfoRepo.findOne({
                where: { id: reqModel.id }
            });

            if (!device) {
                throw new ErrorResponse(0, "Device not found");
            }

            const deviceResponse = new DeviceResponseModel(device.id, device.deviceType, device.deviceName, device.model, device.brandName, device.servicesTag, device.configuration);
            return new GetDeviceByIdModel(true, 0, "Device retrieved successfully", deviceResponse);
        } catch (error) {
            throw error;
        }
    }

    async getAllDevices(): Promise<GetAllDevicesModel> {
        try {
            const devices = await this.deviceInfoRepo.find();

            const deviceResponses = devices.map(device => new DeviceResponseModel(device.id, device.deviceType, device.deviceName, device.model, device.brandName, device.servicesTag, device.configuration));
            return new GetAllDevicesModel(true, 0, "Devices retrieved successfully", deviceResponses);
        } catch (error) {
            throw error;
        }
    }

    async deleteDevice(reqModel: DeleteDeviceModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Device ID is required");
            }

            const existingDevice = await this.deviceInfoRepo.findOne({ where: { id: reqModel.id } });

            if (!existingDevice) {
                throw new ErrorResponse(0, "Device not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(DeviceInfoEntity).delete(reqModel.id);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'DELETE_DEVICE',
                resource: 'DeviceInfo',
                details: `Device ${existingDevice.deviceName} deleted`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: existingDevice.id,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Device deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
