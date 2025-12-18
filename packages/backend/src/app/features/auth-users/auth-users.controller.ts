import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { AuthUsersService } from './auth-users.service';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel } from '@adminvault/shared-models';
import type { Request } from 'express';

@ApiTags('Auth Users')
@Controller('auth-users')
export class AuthUsersController {
    constructor(
        private service: AuthUsersService
    ) { }

    @Post('registerUser')
    async registerUser(@Body() reqModel: RegisterUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.registerUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('loginUser')
    async loginUser(@Body() reqModel: LoginUserModel, @Req() req: Request): Promise<LoginResponseModel> {
        try {
            return await this.service.loginUser(reqModel, req);
        } catch (error) {
            return returnException(LoginResponseModel, error);
        }
    }

    @Post('logOutUser')
    async logOutUser(@Body() reqModel: LogoutUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.logOutUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateUser')
    async updateUser(@Body() reqModel: UpdateUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteUser')
    async deleteUser(@Body() reqModel: DeleteUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllUsers')
    async getAllUsers(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllUsersModel> {
        try {
            return await this.service.getAllUsers(reqModel);
        } catch (error) {
            return returnException(GetAllUsersModel, error);
        }
    }
}
