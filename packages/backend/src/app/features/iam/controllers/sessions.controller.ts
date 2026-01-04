import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { LoginSessionService } from '../../auth-users/login-session.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermission } from '../../../decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('IAM Sessions')
@Controller('iam/sessions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SessionsController {
    constructor(private readonly sessionService: LoginSessionService) { }

    @Post('get-my-sessions')
    @ApiOperation({ summary: 'Get active sessions for current user' })
    async getMySessions(@Req() req: any) {
        try {
            return await this.sessionService.getActiveSessions(req.user.id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-all-active')
    @RequirePermission('Session', 'READ')
    @ApiOperation({ summary: 'Get all active sessions for company (or suspicious ones)' })
    @ApiBody({ schema: { properties: { companyId: { type: 'number' } } } })
    async getAllActiveSessions(@Body('companyId') companyId: number) {
        try {
            // Logic preserved from original controller
            return await this.sessionService.getSuspiciousLogins(companyId);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('logout-session')
    @ApiOperation({ summary: 'Logout specific session' })
    @ApiBody({ schema: { properties: { id: { type: 'number' } } } })
    async logoutSession(@Body('id') id: number) {
        try {
            return await this.sessionService.logoutSession({ sessionId: id });
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('logout-all')
    @ApiOperation({ summary: 'Logout all sessions for current user' })
    async logoutAllSessions(@Req() req: any) {
        try {
            return await this.sessionService.logoutAllSessions(req.user.id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get-suspicious')
    @RequirePermission('Session', 'READ')
    @ApiOperation({ summary: 'Get suspicious login attempts' })
    @ApiBody({ schema: { properties: { companyId: { type: 'number' } } } })
    async getSuspicious(@Body('companyId') companyId: number) {
        try {
            return await this.sessionService.getSuspiciousLogins(companyId);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
