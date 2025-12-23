import { CommonAxiosService } from '../common-axios-service';
import {
    GetStoreAssetsRequestModel, GetStoreAssetsResponseModel,
    GetReturnAssetsRequestModel, GetReturnAssetsResponseModel,
    ProcessReturnRequestModel, ProcessReturnResponseModel,
    GetNextAssignmentsRequestModel, GetNextAssignmentsResponseModel,
    CreateNextAssignmentRequestModel, CreateNextAssignmentResponseModel,
    AssignFromQueueRequestModel, AssignFromQueueResponseModel
} from '@adminvault/shared-models';

export class AssetTabsService extends CommonAxiosService {
    private readonly BASE_PATH = '/asset-info';

    // ============================================
    // STORE ASSETS TAB
    // ============================================
    async getStoreAssets(companyId: number): Promise<GetStoreAssetsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/store-assets`,
            new GetStoreAssetsRequestModel(companyId)
        );
    }

    // ============================================
    // RETURN ASSETS TAB
    // ============================================
    async getReturnAssets(companyId: number, startDate?: string, endDate?: string, employeeId?: number): Promise<GetReturnAssetsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/return-assets`,
            new GetReturnAssetsRequestModel(companyId, startDate, endDate, employeeId)
        );
    }

    async processReturn(data: ProcessReturnRequestModel): Promise<ProcessReturnResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/process-return`, data);
    }

    // ============================================
    // NEXT ASSIGN ASSETS TAB
    // ============================================
    async getNextAssignments(companyId: number): Promise<GetNextAssignmentsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/next-assignments`,
            new GetNextAssignmentsRequestModel(companyId)
        );
    }

    async createNextAssignment(data: CreateNextAssignmentRequestModel): Promise<CreateNextAssignmentResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/create-next-assignment`, data);
    }

    async assignFromQueue(data: AssignFromQueueRequestModel): Promise<AssignFromQueueResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/assign-from-queue`, data);
    }
}
