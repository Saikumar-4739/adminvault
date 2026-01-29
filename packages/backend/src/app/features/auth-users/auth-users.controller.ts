import { Body, Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AuthUsersService } from './auth-users.service';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, RequestAccessModel, ForgotPasswordModel, ResetPasswordModel } from '@adminvault/shared-models';
import { Request, Response } from 'express';
import { Public } from '../../decorators/public.decorator';
import { IAuthenticatedRequest } from '../../interfaces/auth.interface';
import { AuditLog } from '../audit-logs/audit-log.decorator';

@ApiTags('Auth Users')
@Controller('auth-users')
export class AuthUsersController {
    constructor(
        private service: AuthUsersService
    ) { }

    @Post('registerUser')
    @Public()
    @AuditLog({ action: 'REGISTER', module: 'AuthUsers' })
    @ApiBody({ type: RegisterUserModel })
    async registerUser(@Body() reqModel: RegisterUserModel, @Req() req: Request): Promise<GlobalResponse> {
        try {
            const ipAddress = this.extractIp(req);
            return await this.service.registerUser(reqModel, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('loginUser')
    @Public()
    @AuditLog({ action: 'LOGIN', module: 'AuthUsers' })
    @ApiBody({ type: LoginUserModel })
    async loginUser(@Body() reqModel: LoginUserModel, @Req() req: Request): Promise<LoginResponseModel> {
        try {
            return await this.service.loginUser(reqModel, req);
        } catch (error) {
            return returnException(LoginResponseModel, error);
        }
    }

    @Post('logOutUser')
    @AuditLog({ action: 'LOGOUT', module: 'AuthUsers' })
    @ApiBody({ type: LogoutUserModel })
    async logOutUser(@Body() reqModel: LogoutUserModel, @Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            const ipAddress = this.extractIp(req);
            return await this.service.logOutUser(reqModel, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateUser')
    @AuditLog({ action: 'UPDATE', module: 'AuthUsers' })
    @ApiBody({ type: UpdateUserModel })
    async updateUser(@Body() reqModel: UpdateUserModel, @Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            const userId = req.user.userId;
            const ipAddress = this.extractIp(req);
            return await this.service.updateUser(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteUser')
    @AuditLog({ action: 'DELETE', module: 'AuthUsers' })
    @ApiBody({ type: DeleteUserModel })
    async deleteUser(@Body() reqModel: DeleteUserModel, @Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            const userId = req.user.userId;
            const ipAddress = this.extractIp(req);
            return await this.service.deleteUser(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllUsers')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllUsers(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllUsersModel> {
        try {
            return await this.service.getAllUsers(reqModel);
        } catch (error) {
            return returnException(GetAllUsersModel, error);
        }
    }

    @Post('requestAccess')
    @Public()
    @AuditLog({ action: 'REQUEST_ACCESS', module: 'AuthUsers' })
    @ApiBody({ type: RequestAccessModel })
    async requestAccess(@Body() reqModel: RequestAccessModel): Promise<GlobalResponse> {
        try {
            return await this.service.requestAccess(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('forgot-password')
    @Public()
    @AuditLog({ action: 'FORGOT_PASSWORD', module: 'AuthUsers' })
    @ApiBody({ type: ForgotPasswordModel })
    async forgotPassword(@Body() reqModel: ForgotPasswordModel): Promise<GlobalResponse> {
        try {
            return await this.service.forgotPassword(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('reset-password')
    @Public()
    @AuditLog({ action: 'RESET_PASSWORD', module: 'AuthUsers' })
    @ApiBody({ type: ResetPasswordModel })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordModel): Promise<GlobalResponse> {
        try {
            return await this.service.resetPassword(resetPasswordDto);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Get('social/google')
    @Public()
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google OAuth Flow' })
    async googleLogin(): Promise<void> {
        // Guard handles redirection
    }

    @Get('social/google/callback')
    @Public()
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google OAuth Callback' })
    async googleLoginCallback(@Req() req: any, @Res() res: Response): Promise<void> {
        const user = req.user;
        // Generate tokens
        const loginResponse = await this.service.loginSocialUser(user); // Wait, I need to expose generate tokens logic or reuse existing login

        // Redirect to frontend with tokens
        // Ideally we shouldn't send tokens in URL, but for simplicity/MVP or we can set cookies
        // Let's assume we redirect to a frontend page handling the token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        res.redirect(`${frontendUrl}/auth/social-callback?token=${loginResponse.accessToken}&refreshToken=${loginResponse.refreshToken}&userInfo=${encodeURIComponent(JSON.stringify(loginResponse.userInfo))}`);
    }

    @Get('social/microsoft')
    @Public()
    @UseGuards(AuthGuard('microsoft'))
    @ApiOperation({ summary: 'Initiate Microsoft OAuth Flow' })
    async microsoftLogin(): Promise<void> {
        // Guard handles redirection
    }

    @Get('social/microsoft/callback')
    @Public()
    @UseGuards(AuthGuard('microsoft'))
    @ApiOperation({ summary: 'Microsoft OAuth Callback' })
    async microsoftLoginCallback(@Req() req: any, @Res() res: Response): Promise<void> {
        const user = req.user;
        const loginResponse = await this.service.loginSocialUser(user);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
        res.redirect(`${frontendUrl}/auth/social-callback?token=${loginResponse.accessToken}&refreshToken=${loginResponse.refreshToken}`);
    }

    @UseGuards(JwtAuthGuard)
    @Post('verify-password')
    @ApiOperation({ summary: 'Verify user password' })
    @ApiBody({ schema: { type: 'object', properties: { password: { type: 'string' } } } })
    async verifyPassword(@Req() req: any, @Body() body: { password: string }): Promise<GlobalResponse> {
        try {
            const isValid = await this.service.verifyPassword(req.user.userId, body.password);
            if (isValid) {
                return new GlobalResponse(true, 0, "Password verified");
            } else {
                return new GlobalResponse(false, 1, "Invalid password");
            }
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }


    private extractIp(req: Request): string {
        let ip: any = req.headers['x-forwarded-for'] || req.ip || (req as any).connection?.remoteAddress || '127.0.0.1';

        // If x-forwarded-for is an array, take the first one
        if (Array.isArray(ip)) {
            ip = ip[0];
        }

        if (typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }

        return ip as string;
    }
}
