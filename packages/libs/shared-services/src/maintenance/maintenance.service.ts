import { CommonAxiosService } from '../common-axios-service';
import {
    CreateMaintenanceModel,
    MaintenanceResponseModel,
    GlobalResponse
} from '@adminvault/shared-models';
import { AxiosRequestConfig } from 'axios';

export class MaintenanceService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/maintenance/' + childUrl;
    }

    async createSchedule(model: CreateMaintenanceModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('schedule'), model, config);
    }

    async getSchedules(assetId?: number, config?: AxiosRequestConfig): Promise<MaintenanceResponseModel[]> {
        const url = assetId ? this.getURL(`schedules?assetId=${assetId}`) : this.getURL('schedules');
        return await this.axiosGetCall(url, config);
    }

    async updateStatus(id: number, status: string, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL(`status/${id}`), { status }, config);
    }
}
