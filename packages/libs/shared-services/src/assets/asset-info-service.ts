import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    CreateAssetModel,
    UpdateAssetModel,
    DeleteAssetModel,
    GetAssetModel,
    GetAssetByIdModel,
    GetAllAssetsModel,
    GlobalResponse
} from '@adminvault/shared-models';

export class AssetInfoService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/asset-info/' + childUrl;
    }

    async createAsset(reqObj: CreateAssetModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createAsset'), reqObj, config);
    }

    async updateAsset(reqObj: UpdateAssetModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateAsset'), reqObj, config);
    }

    async getAsset(reqObj: GetAssetModel, config?: AxiosRequestConfig): Promise<GetAssetByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAsset'), reqObj, config);
    }

    async getAllAssets(companyId?: number, config?: AxiosRequestConfig): Promise<GetAllAssetsModel> {
        const url = companyId
            ? this.getURLwithMainEndPoint(`getAllAssets?companyId=${companyId}`)
            : this.getURLwithMainEndPoint('getAllAssets');
        return await this.axiosPostCall(url, {}, config);
    }

    async deleteAsset(reqObj: DeleteAssetModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteAsset'), reqObj, config);
    }
}
