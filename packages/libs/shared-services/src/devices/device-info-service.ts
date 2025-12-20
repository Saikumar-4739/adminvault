import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateDeviceModel, UpdateDeviceModel, DeleteDeviceModel, GetDeviceModel, GetDeviceByIdModel, GetAllDevicesModel, GlobalResponse } from '@adminvault/shared-models';

export class DeviceInfoService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/device-info/' + childUrl;
    }

    async createDevice(reqObj: CreateDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createDevice'), reqObj, config);
    }

    async updateDevice(reqObj: UpdateDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateDevice'), reqObj, config);
    }

    async getDevice(reqObj: GetDeviceModel, config?: AxiosRequestConfig): Promise<GetDeviceByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getDevice'), reqObj, config);
    }

    async getAllDevices(config?: AxiosRequestConfig): Promise<GetAllDevicesModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllDevices'), {}, config);
    }

    async deleteDevice(reqObj: DeleteDeviceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteDevice'), reqObj, config);
    }
}
