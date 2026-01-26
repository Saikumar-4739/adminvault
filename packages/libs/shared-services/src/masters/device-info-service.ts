import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateDeviceModel, UpdateDeviceModel, DeleteDeviceModel, GetDeviceModel, GetAllDevicesModel, GetDeviceByIdModel, GlobalResponse } from '@adminvault/shared-models';

export class DeviceInfoService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/device-info/' + childUrl;
    }

    async createDevice(reqModel: CreateDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createDevice'), reqModel, config);
    }

    async updateDevice(reqModel: UpdateDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateDevice'), reqModel, config);
    }

    async getDevice(reqModel: GetDeviceModel, config?: AxiosRequestConfig): Promise<GetDeviceByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getDevice'), reqModel, config);
    }

    async getAllDevices(config?: AxiosRequestConfig): Promise<GetAllDevicesModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllDevices'), {}, config);
    }

    async deleteDevice(reqModel: DeleteDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteDevice'), reqModel, config);
    }
}
