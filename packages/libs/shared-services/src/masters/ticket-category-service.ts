import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateTicketCategoryModel, CreateTicketCategoryResponseModel, GetAllTicketCategoriesResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateTicketCategoryModel, UpdateTicketCategoryResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class TicketCategoryService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllTicketCategories(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllTicketCategoriesResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllTicketCategories'), reqObj, config);
    }

    async createTicketCategory(data: CreateTicketCategoryModel, config?: AxiosRequestConfig): Promise<CreateTicketCategoryResponseModel> {
        return await this.axiosPostCall(this.getURL('ticket-categories'), data, config);
    }

    async updateTicketCategory(data: UpdateTicketCategoryModel, config?: AxiosRequestConfig): Promise<UpdateTicketCategoryResponseModel> {
        return await this.axiosPostCall(this.getURL('updateTicketCategory'), data, config);
    }

    async deleteTicketCategory(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteTicketCategory'), reqObj, config);
    }
}
