import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetTicketByIdModel, GetAllTicketsModel, GlobalResponse, TicketStatusEnum
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

    async getAllTickets(companyId: number, config?: AxiosRequestConfig): Promise<GetAllTicketsModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllTickets'), { id: companyId }, config);
    }

    async deleteTicket(reqObj: DeleteTicketModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteTicket'), reqObj, config);
    }

    async getMyTickets(config?: AxiosRequestConfig): Promise<GetAllTicketsModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getMyTickets'), {}, config);
    }

    async getStatistics(config?: AxiosRequestConfig): Promise<any> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('statistics'), {}, config);
    }

    async updateStatus(id: number, status: TicketStatusEnum, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('status'), { id, status }, config);
    }

    async assignTicket(id: number, assignAdminId: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('assign'), { id, assignAdminId }, config);
    }

    async addResponse(id: number, response: string, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('addResponse'), { id, response }, config);
    }
}
