import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { TicketsService } from './tickets.service';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'; // Ensure correct path

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard) // Apply guard to ensure req.user is populated
export class TicketsController {
    constructor(private service: TicketsService) { }

    @Post('createTicket')
    @ApiBody({ type: CreateTicketModel })
    async createTicket(@Body() reqModel: CreateTicketModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            // req.user should be populated by JwtStrategy
            const userEmail = req.user?.email;
            if (!userEmail) {
                throw new Error("User email not found in token");
            }
            return await this.service.createTicket(reqModel, userEmail);
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
