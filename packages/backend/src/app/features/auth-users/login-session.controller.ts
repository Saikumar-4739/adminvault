import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { LoginSessionService } from './login-session.service';
import { LogoutSessionModel } from '@adminvault/shared-models';
import { Request } from 'express';

@Controller('auth')
export class LoginSessionController {
    constructor(private readonly loginSessionService: LoginSessionService) { }

    @Post('login-history/:userId')
    async getUserLoginHistory(@Param('userId') userId: string) {
        return await this.loginSessionService.getUserLoginHistory(Number(userId));
    }

    @Post('active-sessions/:userId')
    async getActiveSessions(@Param('userId') userId: string) {
        return await this.loginSessionService.getActiveSessions(Number(userId));
    }

    @Post('logout-session')
    async logoutSession(@Body() reqModel: LogoutSessionModel) {
        return await this.loginSessionService.logoutSession(reqModel);
    }

    @Post('logout-all/:userId')
    async logoutAllSessions(@Param('userId') userId: string) {
        return await this.loginSessionService.logoutAllSessions(Number(userId));
    }

    @Post('suspicious-logins/:companyId')
    async getSuspiciousLogins(@Param('companyId') companyId: string) {
        return await this.loginSessionService.getSuspiciousLogins(Number(companyId));
    }
}
