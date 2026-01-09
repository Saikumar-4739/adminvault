import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { GlobalResponse, CreateApprovalRequestModel, ApprovalActionModel } from '@adminvault/shared-models';

export class WorkflowService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/workflow/' + childUrl;
    }

    async initiateApproval(reqObj: CreateApprovalRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('initiate'), reqObj, config);
    }

    async approveRequest(reqObj: ApprovalActionModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('approve'), reqObj, config);
    }

    async rejectRequest(reqObj: ApprovalActionModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('reject'), reqObj, config);
    }

    async getPendingApprovals(companyId: number, config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosGetCall(this.getURLwithMainEndPoint(`pending?companyId=${companyId}`), config);
    }
}
