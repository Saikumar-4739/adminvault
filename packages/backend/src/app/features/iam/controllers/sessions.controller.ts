import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { LoginSessionService } from '../../auth-users/login-session.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermission } from '../../../decorators/permissions.decorator';

@Controller('iam/sessions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SessionsController {
    constructor(private readonly sessionService: LoginSessionService) { }

    @Get('me')
    async getMySessions(@Req() req: any) {
        return this.sessionService.getActiveSessions(req.user.id);
    }

    @Get('active')
    @RequirePermission('Session', 'READ')
    async getAllActiveSessions(@Query('companyId') companyId: string) {
        // Need to implement a global active sessions getter in service
        return this.sessionService.getSuspiciousLogins(parseInt(companyId));
    }

    @Delete(':id')
    async logoutSession(@Param('id') id: string) {
        return this.sessionService.logoutSession({ sessionId: parseInt(id) });
    }

    @Post('logout-all')
    async logoutAllSessions(@Req() req: any) {
        return this.sessionService.logoutAllSessions(req.user.id);
    }

    @Get('suspicious')
    @RequirePermission('Session', 'READ')
    async getSuspicious(@Query('companyId') companyId: string) {
        return this.sessionService.getSuspiciousLogins(parseInt(companyId));
    }
}
