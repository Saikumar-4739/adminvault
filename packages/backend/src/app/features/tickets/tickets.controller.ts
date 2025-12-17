import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { TicketsService } from './tickets.service';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel } from '@adminvault/shared-models';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
    constructor(private service: TicketsService) { }

    @Post('createTicket')
    @ApiBody({ type: CreateTicketModel })
    async createTicket(@Body() reqModel: CreateTicketModel): Promise<GlobalResponse> {
        try {
            return await this.service.createTicket(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateTicket')
    @ApiBody({ type: UpdateTicketModel })
    async updateTicket(@Body() reqModel: UpdateTicketModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateTicket(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getTicket')
    @ApiBody({ type: GetTicketModel })
    async getTicket(@Body() reqModel: GetTicketModel): Promise<GetTicketByIdModel> {
        try {
            return await this.service.getTicket(reqModel);
        } catch (error) {
            return returnException(GetTicketByIdModel, error);
        }
    }

    @Get('getAllTickets')
    async getAllTickets(): Promise<GetAllTicketsModel> {
        try {
            return await this.service.getAllTickets();
        } catch (error) {
            return returnException(GetAllTicketsModel, error);
        }
    }

    @Post('deleteTicket')
    @ApiBody({ type: DeleteTicketModel })
    async deleteTicket(@Body() reqModel: DeleteTicketModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteTicket(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
