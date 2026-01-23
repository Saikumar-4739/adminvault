import { CommonAxiosService } from '../common-axios-service';
import { CreateMaintenanceRequestModel, GetMaintenanceSchedulesRequestModel, GetMaintenanceSchedulesResponseModel, GlobalResponse, UpdateMaintenanceStatusRequestModel } from '@adminvault/shared-models';
import { AxiosRequestConfig } from 'axios';

export class MaintenanceService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/maintenance/' + childUrl;
    }

    async createSchedule(model: CreateMaintenanceRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('createSchedule'), model, config);
    }

    async getSchedules(reqObj: GetMaintenanceSchedulesRequestModel, config?: AxiosRequestConfig): Promise<GetMaintenanceSchedulesResponseModel> {
        return await this.axiosPostCall(this.getURL('getSchedules'), reqObj, config);
    }

    async updateStatus(reqObj: UpdateMaintenanceStatusRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('updateStatus'), reqObj, config);
    }
}
