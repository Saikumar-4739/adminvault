import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    @ApiOperation({ summary: 'Get recent audit logs' })
    async findAll(): Promise<GlobalResponse> {
        try {
            const logs = await this.auditLogService.findAll();
            return new GlobalResponse(true, 200, 'Audit logs retrieved successfully', logs);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
