import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { returnException } from '@adminvault/backend-utils';
import { DashboardStatsResponseModel, CompanyIdRequestModel } from '@adminvault/shared-models';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Post('getDashboardStats')
    @ApiBody({ type: CompanyIdRequestModel })
    @ApiResponse({ type: DashboardStatsResponseModel })
    async getDashboardStats(@Body() reqModel: CompanyIdRequestModel): Promise<DashboardStatsResponseModel> {
        try {
            return await this.dashboardService.getDashboardStats(reqModel);
        } catch (error) {
            return returnException(DashboardStatsResponseModel, error);
        }
    }
}
