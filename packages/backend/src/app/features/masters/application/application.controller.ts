import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationModel, UpdateApplicationModel, GetAllApplicationsResponseModel, CreateApplicationResponseModel, UpdateApplicationResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Applications Master')
@Controller('application')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
    constructor(private applicationService: ApplicationService) { }

    @Post('getAllApplications')
    async getAllApplications(): Promise<GetAllApplicationsResponseModel> {
        try {
            return await this.applicationService.getAllApplications();
        } catch (error) {
            return returnException(GetAllApplicationsResponseModel, error);
        }
    }

    @Post('createApplication')
    @ApiBody({ type: CreateApplicationModel })
    async createApplication(@Body() reqModel: CreateApplicationModel, @Req() req: any): Promise<GlobalResponse> {
        reqModel.userId = req.user.userId;
        reqModel.companyId = req.user.companyId;
        try {
            return await this.applicationService.createApplication(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateApplication')
    @ApiBody({ type: UpdateApplicationModel })
    async updateApplication(@Body() reqModel: UpdateApplicationModel): Promise<GlobalResponse> {
        try {
            return await this.applicationService.updateApplication(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteApplication')
    @ApiBody({ type: IdRequestModel })
    async deleteApplication(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.applicationService.deleteApplication(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

}
