import { Controller, Post, Get, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { CreatePOModel, GlobalResponse } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard'; // Adjust path
import { UserRoleEnum } from '@adminvault/shared-models';

@Controller('procurement')
@UseGuards(JwtAuthGuard)
export class ProcurementController {
    constructor(private readonly service: ProcurementService) { }

    @Post('po')
    async createPO(@Body() reqModel: CreatePOModel, @Request() req): Promise<GlobalResponse> {
        return await this.service.createPO(reqModel, req.user.userId, req.user.email);
    }

    @Get('po')
    async getAllPOs(@Request() req): Promise<GlobalResponse> {
        // Assuming user has companyId
        return await this.service.getAllPOs(req.user.companyId);
    }

    @Get('po/:id')
    async getPO(@Param('id') id: number): Promise<GlobalResponse> {
        return await this.service.getPO(Number(id));
    }
}
