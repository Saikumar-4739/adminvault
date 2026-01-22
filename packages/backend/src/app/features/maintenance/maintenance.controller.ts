import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRequestModel, GetMaintenanceSchedulesRequestModel, GetMaintenanceSchedulesResponseModel, UpdateMaintenanceStatusRequestModel, GlobalResponse } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { returnException } from '@adminvault/backend-utils';
import { IAuthenticatedRequest } from '../../interfaces/auth.interface';

@ApiTags('Maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post('createSchedule')
    @ApiBody({ type: CreateMaintenanceRequestModel })
    async createSchedule(@Body() reqModel: CreateMaintenanceRequestModel): Promise<GlobalResponse> {
        try {
            return await this.maintenanceService.createSchedule(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getSchedules')
    @ApiBody({ type: GetMaintenanceSchedulesRequestModel })
    async getSchedules(@Body() reqModel: GetMaintenanceSchedulesRequestModel, @Request() req: IAuthenticatedRequest): Promise<GetMaintenanceSchedulesResponseModel> {
        try {
            if (!reqModel.companyId) {
                reqModel.companyId = req.user.companyId;
            }
            return await this.maintenanceService.getSchedules(reqModel);
        } catch (error) {
            return returnException(GetMaintenanceSchedulesResponseModel, error);
        }
    }

    @Post('updateStatus')
    @ApiBody({ type: UpdateMaintenanceStatusRequestModel })
    async updateStatus(@Body() reqModel: UpdateMaintenanceStatusRequestModel): Promise<GlobalResponse> {
        try {
            return await this.maintenanceService.updateStatus(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
