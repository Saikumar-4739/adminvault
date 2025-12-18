import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { LoginSessionService } from './login-session.service';
import { LogoutSessionModel } from '@adminvault/shared-models';
import { Request } from 'express';

/**
 * Controller for login session management endpoints
 */
@Controller('auth')
export class LoginSessionController {
    constructor(private readonly loginSessionService: LoginSessionService) { }

    /**
     * Get login history for a user
     * GET /auth/login-history/:userId
     */
    @Get('login-history/:userId')
    async getUserLoginHistory(@Param('userId') userId: string) {
        return await this.loginSessionService.getUserLoginHistory(Number(userId));
    }

    /**
     * Get active sessions for a user
     * GET /auth/active-sessions/:userId
     */
    @Get('active-sessions/:userId')
    async getActiveSessions(@Param('userId') userId: string) {
        return await this.loginSessionService.getActiveSessions(Number(userId));
    }

    /**
     * Logout a specific session
     * POST /auth/logout-session
     */
    @Post('logout-session')
    async logoutSession(@Body() reqModel: LogoutSessionModel) {
        return await this.loginSessionService.logoutSession(reqModel);
    }

    /**
     * Logout all sessions for a user
     * POST /auth/logout-all/:userId
     */
    @Post('logout-all/:userId')
    async logoutAllSessions(@Param('userId') userId: string) {
        return await this.loginSessionService.logoutAllSessions(Number(userId));
    }

    /**
     * Get suspicious logins for a company (Admin only)
     * GET /auth/suspicious-logins/:companyId
     */
    @Get('suspicious-logins/:companyId')
    async getSuspiciousLogins(@Param('companyId') companyId: string) {
        return await this.loginSessionService.getSuspiciousLogins(Number(companyId));
    }
}
