import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceStatusEnum, CreateMaintenanceModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post('schedule')
    async createSchedule(@Body() model: CreateMaintenanceModel) {
        return await this.maintenanceService.createSchedule(model);
    }

    @Get('schedules')
    async getSchedules(@Query('assetId') assetId: number, @Request() req: any) {
        return await this.maintenanceService.getSchedules(assetId, req.user.companyId);
    }

    @Post('status/:id')
    async updateStatus(@Request() req: any, @Body('status') status: MaintenanceStatusEnum) {
        return await this.maintenanceService.updateStatus(Number(req.params.id), status);
    }
}
