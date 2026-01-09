import { CommonAxiosService } from '../common-axios-service';
import { CreatePOModel, GetAllPOsModel, GetPOByIdModel, GlobalResponse } from '@adminvault/shared-models';
import { AxiosRequestConfig } from 'axios';

export class ProcurementService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/procurement/' + childUrl;
    }

    async createPO(model: CreatePOModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('po'), model, config);
    }

    async getAllPOs(config?: AxiosRequestConfig): Promise<GetAllPOsModel> {
        // Updated to use axiosGetCall if it exists, or axiosPostCall if the backend expects it.
        // Looking at backend ProcurementController, it's @Get('po')
        return await this.axiosGetCall(this.getURL('po'), config);
    }

    async getPO(id: number, config?: AxiosRequestConfig): Promise<GetPOByIdModel> {
        return await this.axiosGetCall(this.getURL(`po/${id}`), config);
    }
}
