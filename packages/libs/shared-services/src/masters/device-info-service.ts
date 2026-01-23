import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateDeviceModel, UpdateDeviceModel, DeleteDeviceModel, GetDeviceModel, GetAllDevicesModel, GetDeviceByIdModel, GlobalResponse } from '@adminvault/shared-models';

export class DeviceInfoService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/device-info/' + childUrl;
    }

    async createDevice(data: CreateDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('createDevice'), data, config);
    }

    async updateDevice(data: UpdateDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('updateDevice'), data, config);
    }

    async getDevice(data: GetDeviceModel, config?: AxiosRequestConfig): Promise<GetDeviceByIdModel> {
        return await this.axiosPostCall(this.getURL('getDevice'), data, config);
    }

    async getAllDevices(config?: AxiosRequestConfig): Promise<GetAllDevicesModel> {
        return await this.axiosPostCall(this.getURL('getAllDevices'), {}, config);
    }

    async deleteDevice(data: DeleteDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteDevice'), data, config);
    }
}
