import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationModel, UpdateApplicationModel, GetAllApplicationsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AuditLog } from '../../audit-logs/audit-log.decorator';

@ApiTags('Applications Master')
@Controller('application')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
    constructor(private applicationService: ApplicationService) { }

    @Post('createApplication')
    @AuditLog({ action: 'CREATE', module: 'Application' })
    @ApiBody({ type: CreateApplicationModel })
    async createApplication(@Body() createApplicationModel: CreateApplicationModel): Promise<GlobalResponse> {
        try {
            return await this.applicationService.createApplication(createApplicationModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateApplication')
    @AuditLog({ action: 'UPDATE', module: 'Application' })
    @ApiBody({ type: UpdateApplicationModel })
    async updateApplication(@Body() updateApplicationModel: UpdateApplicationModel): Promise<GlobalResponse> {
        try {
            return await this.applicationService.updateApplication(updateApplicationModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getApplication')
    @ApiBody({ type: IdRequestModel })
    async getApplication(@Body() idRequestModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.applicationService.getApplication(idRequestModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllApplications')
    async getAllApplications(): Promise<GetAllApplicationsResponseModel> {
        try {
            return await this.applicationService.getAllApplications();
        } catch (error) {
            return returnException(GetAllApplicationsResponseModel, error);
        }
    }

    @Post('deleteApplication')
    @AuditLog({ action: 'DELETE', module: 'Application' })
    @ApiBody({ type: IdRequestModel })
    async deleteApplication(@Body() idRequestModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.applicationService.deleteApplication(idRequestModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
