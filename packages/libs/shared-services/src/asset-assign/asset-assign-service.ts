import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAssetAssignByIdModel, GetAllAssetAssignsModel, GlobalResponse } from '@adminvault/shared-models';

export class AssetAssignService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/asset-assign/' + childUrl;
    }

    async createAssignment(reqObj: CreateAssetAssignModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createAssignment'), reqObj, config);
    }

    async updateAssignment(reqObj: UpdateAssetAssignModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateAssignment'), reqObj, config);
    }

    async getAssignment(reqObj: GetAssetAssignModel, config?: AxiosRequestConfig): Promise<GetAssetAssignByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAssignment'), reqObj, config);
    }

    async getAllAssignments(config?: AxiosRequestConfig): Promise<GetAllAssetAssignsModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllAssignments'), {}, config);
    }

    async deleteAssignment(reqObj: DeleteAssetAssignModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteAssignment'), reqObj, config);
    }
}
