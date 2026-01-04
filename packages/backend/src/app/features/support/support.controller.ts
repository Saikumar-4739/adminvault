import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth-users/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SupportTicketStatus } from '../../entities/support-ticket.entity';

@ApiTags('Support')
@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Get()
    @ApiOperation({ summary: 'Get all support tickets for company' })
    async findAll(@Req() req: any) {
        const { companyId } = req.user;
        return {
            status: true,
            message: 'Support tickets retrieved successfully',
            data: await this.supportService.findAll(companyId),
        };
    }

    @Get('my-tickets')
    @ApiOperation({ summary: 'Get tickets created by current user' })
    async findMyTickets(@Req() req: any) {
        const { id: userId } = req.user;
        return {
            status: true,
            message: 'Your tickets retrieved successfully',
            data: await this.supportService.findByUser(userId),
        };
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Get support statistics' })
    async getStatistics(@Req() req: any) {
        const { companyId } = req.user;
        return {
            status: true,
            message: 'Statistics retrieved successfully',
            data: await this.supportService.getStatistics(companyId),
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get support ticket by ID' })
    async findOne(@Param('id') id: number) {
        return {
            status: true,
            message: 'Support ticket retrieved successfully',
            data: await this.supportService.findOne(id),
        };
    }

    @Post()
    @ApiOperation({ summary: 'Create new support ticket' })
    async create(@Req() req: any, @Body() body: any) {
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
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update support ticket' })
    async update(@Param('id') id: number, @Body() body: any) {
        const ticket = await this.supportService.update(id, body);

        return {
            status: true,
            message: 'Support ticket updated successfully',
            data: ticket,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete support ticket' })
    async delete(@Param('id') id: number) {
        const deleted = await this.supportService.delete(id);

        return {
            status: deleted,
            message: deleted ? 'Support ticket deleted successfully' : 'Support ticket not found',
        };
    }

    @Post(':id/status')
    @ApiOperation({ summary: 'Update ticket status' })
    async updateStatus(@Param('id') id: number, @Body() body: { status: SupportTicketStatus }) {
        const ticket = await this.supportService.updateStatus(id, body.status);

        return {
            status: true,
            message: 'Ticket status updated successfully',
            data: ticket,
        };
    }

    @Post(':id/assign')
    @ApiOperation({ summary: 'Assign ticket to support agent' })
    async assignTicket(@Param('id') id: number, @Body() body: { assignedTo: number }) {
        const ticket = await this.supportService.assignTicket(id, body.assignedTo);

        return {
            status: true,
            message: 'Ticket assigned successfully',
            data: ticket,
        };
    }

    @Post(':id/response')
    @ApiOperation({ summary: 'Add response to ticket' })
    async addResponse(@Param('id') id: number, @Body() body: { response: string }) {
        const ticket = await this.supportService.addResponse(id, body.response);

        return {
            status: true,
            message: 'Response added successfully',
            data: ticket,
        };
    }
}
