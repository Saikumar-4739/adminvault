import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuditLogService } from './audit-logs.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';
import { CompanyIdRequestModel } from '@adminvault/shared-models';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Post('getLogs')
    @ApiBody({ type: CompanyIdRequestModel })
    async getLogs(@Body() reqModel: CompanyIdRequestModel, @Req() req: any) {
        try {
            // Use companyId from request body or fallback to user's company if needed.
            // req.user might contain userId.
            const userId = req.user?.userId;

            const logs = await this.auditLogService.getLogs(userId, reqModel.id);
            return new GlobalResponse(true, 200, 'Audit logs retrieved successfully', logs);
        } catch (error) {
            return returnException(error);
        }
    }
}
