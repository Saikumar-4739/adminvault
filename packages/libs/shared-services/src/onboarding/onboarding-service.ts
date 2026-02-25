import { CommonAxiosService } from '../common-axios-service';
import { OnboardingWorkflowModel, GlobalResponse, CreateWorkflowRequest } from '@adminvault/shared-models';
import { AxiosRequestConfig } from 'axios';

export class OnboardingService extends CommonAxiosService {
    constructor() {
        super();
    }

    private getURL(childUrl: string) {
        return '/onboarding/' + childUrl;
    }

    async getActiveWorkflows(companyId: number, config?: AxiosRequestConfig): Promise<OnboardingWorkflowModel[]> {
        return await this.axiosGetCall(this.getURL(`active/${companyId}`), config);
    }

    async getEmployeeWorkflow(employeeId: number, config?: AxiosRequestConfig): Promise<OnboardingWorkflowModel> {
        return await this.axiosGetCall(this.getURL(`employee/${employeeId}`), config);
    }

    async initializeWorkflow(req: CreateWorkflowRequest, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('initialize'), req, config);
    }

    async completeStep(stepId: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL(`step/${stepId}/complete`), {}, config);
    }
}
