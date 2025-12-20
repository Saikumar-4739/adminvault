import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { DeviceInfoService } from './device-info.service';
import { CreateDeviceModel, UpdateDeviceModel, DeleteDeviceModel, GetDeviceModel, GetAllDevicesModel, GetDeviceByIdModel } from '@adminvault/shared-models';

@ApiTags('Device Info')
@Controller('device-info')
export class DeviceInfoController {
    constructor(
        private service: DeviceInfoService
    ) { }

    @Post('createDevice')
    @ApiBody({ type: CreateDeviceModel })
    async createDevice(@Body() reqModel: CreateDeviceModel): Promise<GlobalResponse> {
        try {
            return await this.service.createDevice(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateDevice')
    @ApiBody({ type: UpdateDeviceModel })
    async updateDevice(@Body() reqModel: UpdateDeviceModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateDevice(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getDevice')
    @ApiBody({ type: GetDeviceModel })
    async getDevice(@Body() reqModel: GetDeviceModel): Promise<GetDeviceByIdModel> {
        try {
            return await this.service.getDevice(reqModel);
        } catch (error) {
            return returnException(GetDeviceByIdModel, error);
        }
    }

    @Post('getAllDevices')
    async getAllDevices(): Promise<GetAllDevicesModel> {
        try {
            return await this.service.getAllDevices();
        } catch (error) {
            return returnException(GetAllDevicesModel, error);
        }
    }

    @Post('deleteDevice')
    @ApiBody({ type: DeleteDeviceModel })
    async deleteDevice(@Body() reqModel: DeleteDeviceModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteDevice(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
