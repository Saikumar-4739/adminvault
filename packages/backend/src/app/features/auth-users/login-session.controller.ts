import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { CompanyIdRequestModel, GetActiveSessionsModel, GetUserLoginHistoryModel, IdRequestModel, LogoutSessionModel } from '@adminvault/shared-models';
import { LoginSessionService } from './login-session.service';
import { AuditLog } from '../audit-logs/audit-log.decorator';

@ApiTags('Login Sessions')
@Controller('auth-sessions')
export class LoginSessionController {
    constructor(private readonly loginSessionService: LoginSessionService) { }

    @Post('getUserLoginHistory')
    @ApiBody({ type: IdRequestModel })
    async getUserLoginHistory(@Body() reqModel: IdRequestModel): Promise<GetUserLoginHistoryModel> {
        try {
            return await this.loginSessionService.getUserLoginHistory(reqModel.id);
        } catch (error) {
            return returnException(GetUserLoginHistoryModel, error);
        }
    }

    @Post('getActiveSessions')
    @ApiBody({ type: IdRequestModel })
    async getActiveSessions(@Body() reqModel: IdRequestModel): Promise<GetActiveSessionsModel> {
        try {
            return await this.loginSessionService.getActiveSessions(reqModel.id);
        } catch (error) {
            return returnException(GetActiveSessionsModel, error);
        }
    }

    @Post('logoutSession')
    @AuditLog({ action: 'LOGOUT_SESSION', module: 'LoginSession' })
    @ApiBody({ type: LogoutSessionModel })
    async logoutSession(@Body() reqModel: LogoutSessionModel): Promise<GlobalResponse> {
        try {
            return await this.loginSessionService.logoutSession(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('logoutAllSessions')
    @AuditLog({ action: 'LOGOUT_ALL_SESSIONS', module: 'LoginSession' })
    @ApiBody({ type: IdRequestModel })
    async logoutAllSessions(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.loginSessionService.logoutAllSessions(reqModel.id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getSuspiciousLogins')
    @ApiBody({ type: CompanyIdRequestModel })
    async getSuspiciousLogins(@Body() reqModel: CompanyIdRequestModel): Promise<GetUserLoginHistoryModel> {
        try {
            return await this.loginSessionService.getSuspiciousLogins();
        } catch (error) {
            return returnException(GetUserLoginHistoryModel, error);
        }
    }
}
