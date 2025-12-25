import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAssetByIdModel, GetAllAssetsModel, GlobalResponse, AssetStatisticsResponseModel, AssetSearchRequestModel, GetAssetsWithAssignmentsResponseModel } from '@adminvault/shared-models';

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

    // New Methods for Enhanced Asset Management

    async getAssetStatistics(companyId: number, config?: AxiosRequestConfig): Promise<AssetStatisticsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('statistics'), { companyId }, config);
    }

    async searchAssets(reqObj: AssetSearchRequestModel, config?: AxiosRequestConfig): Promise<GetAllAssetsModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('search'), reqObj, config);
    }

    async getAssetsWithAssignments(companyId: number, config?: AxiosRequestConfig): Promise<GetAssetsWithAssignmentsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('with-assignments'), { companyId }, config);
    }

    async bulkImport(file: File, companyId: number, userId: number, config?: AxiosRequestConfig): Promise<import('@adminvault/shared-models').BulkImportResponseModel> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', String(companyId));
        formData.append('userId', String(userId));

        return await this.axiosPostCall(this.getURLwithMainEndPoint('bulk-import'), formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async getTimeline(assetId: number, companyId: number, config?: AxiosRequestConfig): Promise<import('@adminvault/shared-models').AssetTimelineResponseModel> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint(`${assetId}/timeline?companyId=${companyId}`), config);
    }
}
