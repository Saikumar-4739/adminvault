import { CommonAxiosService } from '../common-axios-service';
import {
    CreateMaintenanceRequestModel,
    GetMaintenanceSchedulesResponseModel,
    GlobalResponse
} from '@adminvault/shared-models';
import { AxiosRequestConfig } from 'axios';

export class MaintenanceService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/maintenance/' + childUrl;
    }

    async createSchedule(model: CreateMaintenanceRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('createSchedule'), model, config);
    }

    async getSchedules(assetId?: number, config?: AxiosRequestConfig): Promise<GetMaintenanceSchedulesResponseModel> {
        // Backend seems to use POST based on logs in Step 148 for getSchedules
        return await this.axiosPostCall(this.getURL('getSchedules'), { assetId }, config);
    }

    async updateStatus(id: number, status: string, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('updateStatus'), { id, status }, config);
    }
}
