import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    CreateTicketModel,
    UpdateTicketModel,
    DeleteTicketModel,
    GetTicketModel,
    GetTicketByIdModel,
    GetAllTicketsModel,
    GlobalResponse
} from '@adminvault/shared-models';

export class TicketsService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/tickets/' + childUrl;
    }

    async createTicket(reqObj: CreateTicketModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createTicket'), reqObj, config);
    }

    async updateTicket(reqObj: UpdateTicketModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateTicket'), reqObj, config);
    }

    async getTicket(reqObj: GetTicketModel, config?: AxiosRequestConfig): Promise<GetTicketByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getTicket'), reqObj, config);
    }

    async getAllTickets(config?: AxiosRequestConfig): Promise<GetAllTicketsModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllTickets'), {}, config);
    }

    async deleteTicket(reqObj: DeleteTicketModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteTicket'), reqObj, config);
    }
}
