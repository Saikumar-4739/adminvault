
import {
    GlobalResponse,
    CreateTicketCategoryModel,
    UpdateTicketCategoryModel,
    GetAllTicketCategoriesResponseModel,
    CreateTicketCategoryResponseModel,
    UpdateTicketCategoryResponseModel,
    IdRequestModel,
    CompanyIdRequestModel
} from '@adminvault/shared-models';
import { CommonAxiosService } from '../common-axios-service';

export class TicketCategoryService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/ticket-categories/' + childUrl;
    }

    async getAllTicketCategories(data: CompanyIdRequestModel): Promise<GetAllTicketCategoriesResponseModel> {
        try {
            const response = await this.axiosPostCall(this.getURLwithMainEndPoint('getAllTicketCategories'), data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async createTicketCategory(data: CreateTicketCategoryModel): Promise<CreateTicketCategoryResponseModel> {
        try {
            const response = await this.axiosPostCall(this.getURLwithMainEndPoint('createTicketCategory'), data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateTicketCategory(data: UpdateTicketCategoryModel): Promise<UpdateTicketCategoryResponseModel> {
        try {
            const response = await this.axiosPostCall(this.getURLwithMainEndPoint('updateTicketCategory'), data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteTicketCategory(data: IdRequestModel): Promise<GlobalResponse> {
        try {
            const response = await this.axiosPostCall(this.getURLwithMainEndPoint('deleteTicketCategory'), data);
            return response;
        } catch (error) {
            throw error;
        }
    }
}
