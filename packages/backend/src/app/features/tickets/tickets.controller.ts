import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { TicketsService } from './tickets.service';
import { CreateTicketModel, UpdateTicketModel, DeleteTicketModel, GetTicketModel, GetAllTicketsModel, GetTicketByIdModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
    constructor(private service: TicketsService) { }

    /**
     * Create a new support ticket
     * Requires authentication - extracts user email from JWT token
     * @param reqModel - Ticket creation data
     * @param req - Express request with authenticated user
     * @returns GlobalResponse indicating ticket creation success
     */
    @Post('createTicket')
    @ApiOperation({ summary: 'Create new ticket' })
    @ApiBody({ type: CreateTicketModel })
    async createTicket(@Body() reqModel: CreateTicketModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            // req.user should be populated by JwtStrategy
            const userEmail = req.user?.email;
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            if (!userEmail) {
                throw new Error("User email not found in token");
            }
            return await this.service.createTicket(reqModel, userEmail, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Update existing ticket information
     * @param reqModel - Ticket update data
     * @returns GlobalResponse indicating update success
     */
    @Post('updateTicket')
    @ApiOperation({ summary: 'Update ticket' })
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

    /**
     * Retrieve a specific ticket by ID
     * @param reqModel - Request with ticket ID
     * @returns GetTicketByIdModel with ticket details
     */
    @Post('getTicket')
    @ApiOperation({ summary: 'Get ticket by ID' })
    @ApiBody({ type: GetTicketModel })
    async getTicket(@Body() reqModel: GetTicketModel): Promise<GetTicketByIdModel> {
        try {
            return await this.service.getTicket(reqModel);
        } catch (error) {
            return returnException(GetTicketByIdModel, error);
        }
    }

    /**
     * Retrieve all tickets in the system
     * @returns GetAllTicketsModel with list of all tickets
     */
    @Post('getAllTickets')
    @ApiOperation({ summary: 'Get all tickets' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllTickets(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllTicketsModel> {
        try {
            // Updated to pass companyId if service supports it, otherwise generic get
            // Assuming service update might be needed later, but standardizing controller signature first
            return await this.service.getAllTickets(reqModel.id);
        } catch (error) {
            return returnException(GetAllTicketsModel, error);
        }
    }

    /**
     * Delete a ticket (soft delete)
     * @param reqModel - Request with ticket ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('deleteTicket')
    @ApiOperation({ summary: 'Delete ticket' })
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

    /**
     * Retrieve tickets for the authenticated user
     * @param req - Express request with authenticated user
     * @returns GetAllTicketsModel with list of user's tickets
     */
    @Post('getMyTickets')
    @ApiOperation({ summary: 'Get tickets for current user' })
    async getMyTickets(@Req() req: any): Promise<GetAllTicketsModel> {
        try {
            const userEmail = req.user?.email;
            if (!userEmail) {
                throw new Error("User email not found in token");
            }
            return await this.service.getTicketsByUser(userEmail);
        } catch (error) {
            return returnException(GetAllTicketsModel, error);
        }
    }
}
