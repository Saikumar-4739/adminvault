import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { DashboardStatsResponseModel } from '@adminvault/shared-models';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Post('getDashboardStats')
    @ApiResponse({ type: DashboardStatsResponseModel })
    async getDashboardStats(): Promise<DashboardStatsResponseModel> {
        try {
            return await this.dashboardService.getDashboardStats();
        } catch (error) {
            return returnException(DashboardStatsResponseModel, error);
        }
    }
}
