import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateApplicationModel, CreateApplicationResponseModel, GetAllApplicationsResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateApplicationModel, UpdateApplicationResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class ApplicationService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllApplications(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllApplicationsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllApplications'), reqObj, config);
    }

    async createApplication(data: CreateApplicationModel, config?: AxiosRequestConfig): Promise<CreateApplicationResponseModel> {
        return await this.axiosPostCall(this.getURL('applications'), data, config);
    }

    async updateApplication(data: UpdateApplicationModel, config?: AxiosRequestConfig): Promise<UpdateApplicationResponseModel> {
        return await this.axiosPostCall(this.getURL('updateApplication'), data, config);
    }

    async deleteApplication(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteApplication'), reqObj, config);
    }
}
