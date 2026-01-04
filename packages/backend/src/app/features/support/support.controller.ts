import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SupportTicketStatus } from './entities/support-ticket.entity';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('findAll')
    @ApiOperation({ summary: 'Get all support tickets for company' })
    async findAll(@Req() req: any) {
        try {
            const { companyId } = req.user;
            return {
                status: true,
                message: 'Support tickets retrieved successfully',
                data: await this.supportService.findAll(companyId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('my-tickets')
    @ApiOperation({ summary: 'Get tickets created by current user' })
    async findMyTickets(@Req() req: any) {
        try {
            const { id: userId } = req.user;
            return {
                status: true,
                message: 'Your tickets retrieved successfully',
                data: await this.supportService.findByUser(userId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('statistics')
    @ApiOperation({ summary: 'Get support statistics' })
    async getStatistics(@Req() req: any) {
        try {
            const { companyId } = req.user;
            return {
                status: true,
                message: 'Statistics retrieved successfully',
                data: await this.supportService.getStatistics(companyId),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('findOne')
    @ApiOperation({ summary: 'Get support ticket by ID' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async findOne(@Body('id') id: number) {
        try {
            return {
                status: true,
                message: 'Support ticket retrieved successfully',
                data: await this.supportService.findOne(id),
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('create')
    @ApiOperation({ summary: 'Create new support ticket' })
    @ApiBody({ schema: { type: 'object' } })
    async create(@Req() req: any, @Body() body: any) {
        try {
            const { companyId, id: userId } = req.user;
            const ticket = await this.supportService.create({
                ...body,
                companyId,
                createdBy: userId,
            });

            return {
                status: true,
                message: 'Support ticket created successfully',
                data: ticket,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('update')
    @ApiOperation({ summary: 'Update support ticket' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async update(@Body() body: any) {
        try {
            const { id, ...data } = body;
            const ticket = await this.supportService.update(id, data);

            return {
                status: true,
                message: 'Support ticket updated successfully',
                data: ticket,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('delete')
    @ApiOperation({ summary: 'Delete support ticket' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async delete(@Body('id') id: number) {
        try {
            const deleted = await this.supportService.delete(id);
            return {
                status: deleted,
                message: deleted ? 'Support ticket deleted successfully' : 'Support ticket not found',
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('status')
    @ApiOperation({ summary: 'Update ticket status' })
    @ApiBody({ schema: { properties: { id: { type: 'number' }, status: { type: 'string' } } } })
    async updateStatus(@Body() body: { id: number, status: SupportTicketStatus }) {
        try {
            const ticket = await this.supportService.updateStatus(body.id, body.status);
            return {
                status: true,
                message: 'Ticket status updated successfully',
                data: ticket,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('assign')
    @ApiOperation({ summary: 'Assign ticket to support agent' })
    @ApiBody({ schema: { properties: { id: { type: 'number' }, assignedTo: { type: 'number' } } } })
    async assignTicket(@Body() body: { id: number, assignedTo: number }) {
        try {
            const ticket = await this.supportService.assignTicket(body.id, body.assignedTo);
            return {
                status: true,
                message: 'Ticket assigned successfully',
                data: ticket,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('response')
    @ApiOperation({ summary: 'Add response to ticket' })
    @ApiBody({ schema: { properties: { id: { type: 'number' }, response: { type: 'string' } } } })
    async addResponse(@Body() body: { id: number, response: string }) {
        try {
            const ticket = await this.supportService.addResponse(body.id, body.response);
            return {
                status: true,
                message: 'Response added successfully',
                data: ticket,
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
