import { Body, Controller, Post, Req, Get, Query, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AuthUsersService } from './auth-users.service';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, RequestAccessModel } from '@adminvault/shared-models';
import type { Request, Response } from 'express';
import { Public } from '../../decorators/public.decorator';

@ApiTags('Auth Users')
@Controller('auth-users')
export class AuthUsersController {
    constructor(
        private service: AuthUsersService
    ) { }

    @Post('registerUser')
    @Public()
    @ApiBody({ type: RegisterUserModel })
    async registerUser(@Body() reqModel: RegisterUserModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const ipAddress = this.extractIp(req);
            return await this.service.registerUser(reqModel, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('loginUser')
    @Public()
    @ApiBody({ type: LoginUserModel })
    async loginUser(@Body() reqModel: LoginUserModel, @Req() req: Request): Promise<LoginResponseModel> {
        try {
            return await this.service.loginUser(reqModel, req);
        } catch (error) {
            return returnException(LoginResponseModel, error);
        }
    }

    @Post('logOutUser')
    @ApiBody({ type: LogoutUserModel })
    async logOutUser(@Body() reqModel: LogoutUserModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const ipAddress = this.extractIp(req);
            return await this.service.logOutUser(reqModel, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateUser')
    @ApiBody({ type: UpdateUserModel })
    async updateUser(@Body() reqModel: UpdateUserModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = this.extractIp(req);
            return await this.service.updateUser(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteUser')
    @ApiBody({ type: DeleteUserModel })
    async deleteUser(@Body() reqModel: DeleteUserModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
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
    @ApiBody({ type: RequestAccessModel })
    async requestAccess(@Body() reqModel: RequestAccessModel): Promise<GlobalResponse> {
        try {
            return await this.service.requestAccess(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Get('sso/login')
    @Public()
    async ssoLogin(@Query('provider') provider: string, @Res() res: Response) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        try {
            if (provider !== 'microsoft' && provider !== 'google') {
                return res.redirect(`${frontendUrl}/login?error=Invalid_Provider`);
            }
            const authUrl = await this.service.getSSOAuthUrl(provider as 'microsoft' | 'google');
            return res.redirect(authUrl);
        } catch (error: any) {
            return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
        }
    }

    @Get('sso/callback')
    @Public()
    async ssoCallback(@Query('code') code: string, @Query('state') state: string, @Req() req: any, @Res() res: Response) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        try {
            if (!code || !state) {
                return res.redirect(`${frontendUrl}/login?error=Invalid_Callback_Params`);
            }

            const ipAddress = this.extractIp(req);
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const loginResponse = await this.service.handleSSOCallback(state, code, ipAddress, userAgent);

            // Redirect to frontend with token
            const userJson = JSON.stringify(loginResponse.userInfo);
            const redirectUrl = `${frontendUrl}/login/callback?token=${loginResponse.accessToken}&refreshToken=${loginResponse.refreshToken}&user=${encodeURIComponent(userJson)}`;
            return res.redirect(redirectUrl);

        } catch (error: any) {
            const message = error?.message || 'SSO_Login_Failed';
            return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
        }
    }

    private extractIp(req: any): string {
        let ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '127.0.0.1';
        if (typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }
        return ip as string;
    }
}
