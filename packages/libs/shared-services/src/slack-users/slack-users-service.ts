import { CommonAxiosService } from '../common-axios-service';
import {
    CreateSlackUserModel, UpdateSlackUserModel, DeleteSlackUserModel,
    GetSlackUserModel, GetAllSlackUsersModel, GetSlackUserByIdModel, GlobalResponse
} from '@adminvault/shared-models';

export class SlackUsersService extends CommonAxiosService {
    private BASE_PATH = '/slack-users';

    async createSlackUser(reqModel: CreateSlackUserModel): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/create`, reqModel);
    }

    async updateSlackUser(reqModel: UpdateSlackUserModel): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/update`, reqModel);
    }

    async deleteSlackUser(reqModel: DeleteSlackUserModel): Promise<GlobalResponse> {
        return await this.axiosPostCall(`${this.BASE_PATH}/delete`, reqModel);
    }

    async getSlackUser(reqModel: GetSlackUserModel): Promise<GetSlackUserByIdModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/get`, reqModel);
    }

    async getAllSlackUsers(companyId?: number): Promise<GetAllSlackUsersModel> {
        const url = companyId ? `${this.BASE_PATH}/getAll?companyId=${companyId}` : `${this.BASE_PATH}/getAll`;
        return await this.axiosPostCall(url);
    }
}
