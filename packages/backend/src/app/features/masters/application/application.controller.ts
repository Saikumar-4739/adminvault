import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationModel, UpdateApplicationModel, GetAllApplicationsResponseModel, CreateApplicationResponseModel, UpdateApplicationResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Applications Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
    constructor(private applicationService: ApplicationService) { }

    @Post('getAllApplications')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllApplications(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllApplicationsResponseModel> {
        try {
            return await this.applicationService.getAllApplications(reqModel);
        } catch (error) {
            return returnException(GetAllApplicationsResponseModel, error);
        }
    }

    @Post('applications')
    @ApiBody({ type: CreateApplicationModel })
    async createApplication(@Body() data: CreateApplicationModel, @Req() req: any): Promise<CreateApplicationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.applicationService.createApplication(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateApplicationResponseModel, error);
        }
    }

    @Post('updateApplication')
    @ApiBody({ type: UpdateApplicationModel })
    async updateApplication(@Body() data: UpdateApplicationModel, @Req() req: any): Promise<UpdateApplicationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.applicationService.updateApplication(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateApplicationResponseModel, error);
        }
    }

    @Post('deleteApplication')
    @ApiBody({ type: IdRequestModel })
    async deleteApplication(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.applicationService.deleteApplication(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
