import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { TicketsService } from './tickets.service';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel, CompanyIdRequestModel, UpdateTicketStatusRequestModel, AssignTicketRequestModel, AddTicketResponseRequestModel, GetTicketStatisticsRequestModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuditLog } from '../audit-logs/audit-log.decorator';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private service: TicketsService) { }

    @Post('createTicket')
    @AuditLog({ action: 'CREATE', module: 'Tickets' })
    @ApiBody({ type: CreateTicketModel })
    async createTicket(@Body() reqModel: CreateTicketModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userEmail = req.user?.email;
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            if (!userEmail) {
                throw new Error('User email not found in token');
            }
            return await this.service.createTicket(reqModel, userEmail, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateTicket')
    @AuditLog({ action: 'UPDATE', module: 'Tickets' })
    @ApiBody({ type: UpdateTicketModel })
    async updateTicket(@Body() reqModel: UpdateTicketModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.updateTicket(reqModel, userId, ipAddress);
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

    @Post('getAllTickets')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllTickets(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllTicketsModel> {
        try {
            return await this.service.getAllTickets(reqModel.companyId);
        } catch (error) {
            return returnException(GetAllTicketsModel, error);
        }
    }

    @Post('deleteTicket')
    @AuditLog({ action: 'DELETE', module: 'Tickets' })
    @ApiBody({ type: DeleteTicketModel })
    async deleteTicket(@Body() reqModel: DeleteTicketModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.deleteTicket(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getMyTickets')
    async getMyTickets(@Req() req: any): Promise<GetAllTicketsModel> {
        try {
            const userEmail = req.user?.email;
            if (!userEmail) {
                throw new Error('User email not found in token');
            }
            return await this.service.getTicketsByUser(userEmail);
        } catch (error) {
            return returnException(GetAllTicketsModel, error);
        }
    }

    @Post('statistics')
    @ApiBody({ type: GetTicketStatisticsRequestModel })
    async getStatistics(@Body() reqModel: GetTicketStatisticsRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.getStatistics(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('status')
    @AuditLog({ action: 'UPDATE_STATUS', module: 'Tickets' })
    @ApiBody({ type: UpdateTicketStatusRequestModel })
    async updateStatus(@Body() reqModel: UpdateTicketStatusRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateStatus(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('assign')
    @AuditLog({ action: 'ASSIGN', module: 'Tickets' })
    @ApiBody({ type: AssignTicketRequestModel })
    async assignTicket(@Body() reqModel: AssignTicketRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.assignTicket(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('addResponse')
    @AuditLog({ action: 'ADD_RESPONSE', module: 'Tickets' })
    @ApiBody({ type: AddTicketResponseRequestModel })
    async addResponse(@Body() reqModel: AddTicketResponseRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.addResponse(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
