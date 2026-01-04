import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AuthUsersService } from './auth-users.service';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, RequestAccessModel } from '@adminvault/shared-models';
import type { Request } from 'express';
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
