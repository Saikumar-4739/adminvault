import { Body, Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AuthUsersService } from './auth-users.service';
import { DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, RequestAccessModel, ForgotPasswordModel, ResetPasswordModel } from '@adminvault/shared-models';
import { CompanyIdDto } from '../../common/dto/common.dto';
import { LoginUserDto, RegisterUserDto, ForgotPasswordDto, ResetPasswordDto, UpdateUserDto, RequestAccessDto } from './dto/auth.dto';
import { Request, Response } from 'express';
import { Public } from '../../decorators/public.decorator';
import { IAuthenticatedRequest } from '../../interfaces/auth.interface';

@ApiTags('Auth Users')
@Controller('auth-users')
export class AuthUsersController {
    constructor(
        private service: AuthUsersService
    ) { }

    @Post('registerUser')
    @Public()
    @ApiBody({ type: RegisterUserDto })
    async registerUser(@Body() reqModel: RegisterUserDto, @Req() req: Request): Promise<GlobalResponse> {
        try {
            const ipAddress = this.extractIp(req);
            return await this.service.registerUser(reqModel, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('loginUser')
    @Public()
    @ApiBody({ type: LoginUserDto })
    async loginUser(@Body() reqModel: LoginUserDto, @Req() req: Request): Promise<LoginResponseModel> {
        try {
            return await this.service.loginUser(reqModel, req);
        } catch (error) {
            return returnException(LoginResponseModel, error);
        }
    }

    @Post('refresh-token')
    @Public()
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } })
    async refreshToken(@Body() body: { refreshToken: string }): Promise<LoginResponseModel> {
        try {
            return await this.service.refreshToken(body.refreshToken);
        } catch (error) {
            return returnException(LoginResponseModel, error);
        }
    }

    @Post('logOutUser')
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
    @ApiBody({ type: UpdateUserDto })
    async updateUser(@Body() reqModel: UpdateUserDto, @Req() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            const userId = req.user.userId;
            const ipAddress = this.extractIp(req);
            return await this.service.updateUser(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteUser')
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
    @ApiBody({ type: CompanyIdDto })
    async getAllUsers(@Body() reqModel: CompanyIdDto): Promise<GetAllUsersModel> {
        try {
            return await this.service.getAllUsers(reqModel);
        } catch (error) {
            return returnException(GetAllUsersModel, error);
        }
    }

    @Post('requestAccess')
    @Public()
    @ApiBody({ type: RequestAccessDto })
    async requestAccess(@Body() reqModel: RequestAccessDto): Promise<GlobalResponse> {
        try {
            return await this.service.requestAccess(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('forgot-password')
    @Public()
    @ApiBody({ type: ForgotPasswordDto })
    async forgotPassword(@Body() reqModel: ForgotPasswordDto): Promise<GlobalResponse> {
        try {
            return await this.service.forgotPassword(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('reset-password')
    @Public()
    @ApiBody({ type: ResetPasswordDto })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<GlobalResponse> {
        try {
            return await this.service.resetPassword(resetPasswordDto);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
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
    @Get('google')
    @Public()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: Request) {
        // Initiates Google OAuth2 flow
    }

    @Get('google/callback')
    @Public()
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
        try {
            const googleProfile = req.user;
            const user = await this.service.validateGoogleUser(googleProfile);

            // Generate tokens (similar to loginUser logic but for OAuth)
            const payload = {
                username: user.email,
                email: user.email,
                sub: user.id,
                companyId: user.companyId,
                role: user.userRole
            };

            // Note: Since I can't easily access the private token generation methods from within the controller 
            // without making them public or adding a service method, I'll assume I should have a service method 
            // for generating tokens from a user object.
            // For now, I'll redirect to the frontend with the tokens in the URL or handle it as a session.
            // Best practice for NestJS with Passport is often to use the service to generate response.

            const response = await this.service.loginUserFromOAuth(user);

            // Redirect to frontend with tokens (or handle as needed)
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/auth/callback?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`);
        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
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
