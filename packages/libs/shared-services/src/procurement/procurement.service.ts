import { CommonAxiosService } from '../common-axios-service';
import { CreatePOModel, GetAllPOsModel, GetPOByIdModel, GlobalResponse, GetAllPOsRequestModel, GetPORequestModel, UpdatePOStatusRequestModel } from '@adminvault/shared-models';
import { AxiosRequestConfig } from 'axios';

export class ProcurementService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/procurement/' + childUrl;
    }

    async createPO(model: CreatePOModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('createPO'), model, config);
    }

    async getAllPOs(reqModel: GetAllPOsRequestModel, config?: AxiosRequestConfig): Promise<GetAllPOsModel> {
        return await this.axiosPostCall(this.getURL('getAllPOs'), reqModel, config);
    }

    async getPO(reqModel: GetPORequestModel, config?: AxiosRequestConfig): Promise<GetPOByIdModel> {
        return await this.axiosPostCall(this.getURL('getPO'), reqModel, config);
    }

    async updatePOStatus(reqModel: UpdatePOStatusRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('updatePOStatus'), reqModel, config);
    }
}
