import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateApplicationModel, CreateApplicationResponseModel, GetAllApplicationsResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateApplicationModel, UpdateApplicationResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class ApplicationService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/application/' + childUrl;
    }

    async getAllApplications(config?: AxiosRequestConfig): Promise<GetAllApplicationsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllApplications'), {}, config);
    }

    async createApplication(reqModel: CreateApplicationModel, config?: AxiosRequestConfig): Promise<CreateApplicationResponseModel> {
        return await this.axiosPostCall(this.getURL('createApplication'), reqModel, config);
    }

    async updateApplication(reqModel: UpdateApplicationModel, config?: AxiosRequestConfig): Promise<UpdateApplicationResponseModel> {
        return await this.axiosPostCall(this.getURL('updateApplication'), reqModel, config);
    }

    async deleteApplication(reqModel: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteApplication'), reqModel, config);
    }
}
