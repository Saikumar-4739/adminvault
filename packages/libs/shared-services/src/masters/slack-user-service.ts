import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateSlackUserModel, CreateSlackUserResponseModel, GetAllSlackUsersResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateSlackUserModel, UpdateSlackUserResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class SlackUserService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllSlackUsers(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllSlackUsersResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllSlackUsers'), reqObj, config);
    }

    async createSlackUser(data: CreateSlackUserModel, config?: AxiosRequestConfig): Promise<CreateSlackUserResponseModel> {
        return await this.axiosPostCall(this.getURL('createSlackUser'), data, config);
    }

    async updateSlackUser(data: UpdateSlackUserModel, config?: AxiosRequestConfig): Promise<UpdateSlackUserResponseModel> {
        return await this.axiosPostCall(this.getURL('updateSlackUser'), data, config);
    }

    async deleteSlackUser(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteSlackUser'), reqObj, config);
    }
}
