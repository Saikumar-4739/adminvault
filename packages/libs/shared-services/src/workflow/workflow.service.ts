import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { GlobalResponse, CreateApprovalRequestModel, ApprovalActionModel, GetPendingApprovalsRequestModel, GetPendingApprovalsResponseModel, InitiateApprovalResponseModel, ApproveRequestResponseModel, RejectRequestResponseModel } from '@adminvault/shared-models';

export class WorkflowService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/workflow/' + childUrl;
    }

    async initiateApproval(reqObj: CreateApprovalRequestModel, config?: AxiosRequestConfig): Promise<InitiateApprovalResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('initiate'), reqObj, config);
    }

    async approveRequest(reqObj: ApprovalActionModel, config?: AxiosRequestConfig): Promise<ApproveRequestResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('approve'), reqObj, config);
    }

    async rejectRequest(reqObj: ApprovalActionModel, config?: AxiosRequestConfig): Promise<RejectRequestResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('reject'), reqObj, config);
    }

    async getPendingApprovals(reqObj: GetPendingApprovalsRequestModel, config?: AxiosRequestConfig): Promise<GetPendingApprovalsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('pending'), reqObj, config);
    }
}
