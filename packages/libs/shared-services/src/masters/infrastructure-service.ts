import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateInfrastructureMasterModel, UpdateInfrastructureMasterModel, DeleteInfrastructureMasterModel, GetAllInfrastructureMasterResponseModel, GlobalResponse, IdRequestModel } from '@adminvault/shared-models';

export class InfrastructureService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/infrastructure/' + childUrl;
    }

    async getAllInfrastructure(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GetAllInfrastructureMasterResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllInfrastructure'), reqObj, config);
    }

    async createInfrastructure(reqObj: CreateInfrastructureMasterModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createInfrastructure'), reqObj, config);
    }

    async updateInfrastructure(reqObj: UpdateInfrastructureMasterModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateInfrastructure'), reqObj, config);
    }

    async deleteInfrastructure(reqObj: DeleteInfrastructureMasterModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteInfrastructure'), reqObj, config);
    }
}
