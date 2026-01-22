import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateAssetModel, UpdateAssetModel, DeleteAssetModel, GetAssetModel, GetAssetByIdModel, GetAllAssetsModel, GlobalResponse, AssetStatisticsResponseModel, AssetSearchRequestModel, GetAssetsWithAssignmentsResponseModel, GetStoreAssetsRequestModel, GetStoreAssetsResponseModel, GetReturnAssetsRequestModel, GetReturnAssetsResponseModel, ProcessReturnRequestModel, ProcessReturnResponseModel, GetNextAssignmentsRequestModel, GetNextAssignmentsResponseModel, CreateNextAssignmentRequestModel, CreateNextAssignmentResponseModel, AssignFromQueueRequestModel, AssignFromQueueResponseModel, BulkImportResponseModel, AssetTimelineResponseModel, CreateAssetAssignModel, UpdateAssetAssignModel, GetAssetAssignModel, GetAllAssetAssignsModel, GetAssetAssignByIdModel } from '@adminvault/shared-models';

export class AssetInfoService extends CommonAxiosService {
    private readonly BASE_PATH = '/asset-info';

    async getTimeline(assetId: number, companyId: number, config?: AxiosRequestConfig): Promise<AssetTimelineResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/timeline`, { id: assetId, companyId }, config);
    }

    async bulkImport(file: File, companyId: number, userId: number, config?: AxiosRequestConfig): Promise<BulkImportResponseModel> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', String(companyId));
        formData.append('userId', String(userId));
        return await this.axiosPostCall(`${this.BASE_PATH}/bulk-import`, formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async createAsset(reqObj: CreateAssetModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/createAsset`, reqObj, config);
    }

    async updateAsset(reqObj: UpdateAssetModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateAsset`, reqObj, config);
    }

    async getAsset(reqObj: GetAssetModel, config?: AxiosRequestConfig): Promise<GetAssetByIdModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/getAsset`, reqObj, config);
    }

    async getAllAssets(companyId: number, config?: AxiosRequestConfig): Promise<GetAllAssetsModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/getAllAssets`, { companyId }, config);
    }

    async deleteAsset(reqObj: DeleteAssetModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/deleteAsset`, reqObj, config);
    }

    // --- STATISTICS & SEARCH ---
    async getAssetStatistics(companyId: number, config?: AxiosRequestConfig): Promise<AssetStatisticsResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/statistics`, { companyId }, config);
    }

    async searchAssets(reqObj: AssetSearchRequestModel, config?: AxiosRequestConfig): Promise<GetAllAssetsModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/search`, reqObj, config);
    }

    async getAssetsWithAssignments(companyId: number, config?: AxiosRequestConfig): Promise<GetAssetsWithAssignmentsResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/with-assignments`, { companyId }, config);
    }

    async getStoreAssets(reqObj: GetStoreAssetsRequestModel, config?: AxiosRequestConfig): Promise<GetStoreAssetsResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/store-assets`, reqObj, config);
    }

    async getReturnAssets(reqObj: GetReturnAssetsRequestModel, config?: AxiosRequestConfig): Promise<GetReturnAssetsResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/return-assets`, reqObj, config);
    }

    async processReturn(reqObj: ProcessReturnRequestModel, config?: AxiosRequestConfig): Promise<ProcessReturnResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/process-return`, reqObj, config);
    }

    async getNextAssignments(reqObj: GetNextAssignmentsRequestModel, config?: AxiosRequestConfig): Promise<GetNextAssignmentsResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/next-assignments`, reqObj, config);
    }

    async createNextAssignment(reqObj: CreateNextAssignmentRequestModel, config?: AxiosRequestConfig): Promise<CreateNextAssignmentResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/create-next-assignment`, reqObj, config);
    }

    async assignFromQueue(reqObj: AssignFromQueueRequestModel, config?: AxiosRequestConfig): Promise<AssignFromQueueResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/assign-from-queue`, reqObj, config);
    }

    async createAssignment(reqObj: CreateAssetAssignModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/createAssignment`, reqObj, config);
    }

    async updateAssignment(reqObj: UpdateAssetAssignModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateAssignment`, reqObj, config);
    }

    async getAssignment(reqObj: GetAssetAssignModel, config?: AxiosRequestConfig): Promise<GetAssetAssignByIdModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/getAssignment`, reqObj, config);
    }

    async getAllAssignments(companyId: number, config?: AxiosRequestConfig): Promise<GetAllAssetAssignsModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/getAllAssignments`, { companyId }, config);
    }
}
