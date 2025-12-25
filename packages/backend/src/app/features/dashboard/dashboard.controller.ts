import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { DashboardStatsResponseModel } from '@adminvault/shared-models';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Post()
    async getDashboardStats(): Promise<DashboardStatsResponseModel> {
        return await this.dashboardService.getDashboardStats();
    }
}
