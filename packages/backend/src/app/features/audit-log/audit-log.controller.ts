import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';
import { GetAllAuditLogsResponseModel, GetAuditLogsRequestModel } from '@adminvault/shared-models';

@ApiTags('Audit Log')
@Controller('audit-log')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
    constructor(private service: AuditLogService) { }

    @Post('getAllLogs')
    async getAllLogs(): Promise<GetAllAuditLogsResponseModel> {
        try {
            return await this.service.getAllLogs();
        } catch (error) {
            return returnException(GetAllAuditLogsResponseModel, error);
        }
    }

    @Post('getLogsByEntity')
    @ApiBody({ type: GetAuditLogsRequestModel })
    async getLogsByEntity(@Body() reqModel: GetAuditLogsRequestModel): Promise<GetAllAuditLogsResponseModel> {
        try {
            return await this.service.getLogsByEntity(reqModel.entityType, reqModel.entityId);
        } catch (error) {
            return returnException(GetAllAuditLogsResponseModel, error);
        }
    }
}
