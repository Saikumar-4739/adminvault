import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

    /**
     * Register a new user account
     * Public endpoint - no authentication required
     * @param reqModel - User registration data
     * @returns GlobalResponse indicating registration success or failure
     */
    @Post('registerUser')
    @Public()
    async registerUser(@Body() reqModel: RegisterUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.registerUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Authenticate user and create session
     * Public endpoint - no authentication required
     * @param reqModel - Login credentials
     * @param req - Express request object for session tracking
     * @returns LoginResponseModel with tokens and user info
     */
    @Post('loginUser')
    @Public()
    async loginUser(@Body() reqModel: LoginUserModel, @Req() req: Request): Promise<LoginResponseModel> {
        try {
            return await this.service.loginUser(reqModel, req);
        } catch (error) {
            return returnException(LoginResponseModel, error);
        }
    }

    /**
     * Log out user and update session
     * @param reqModel - Logout request with user email
     * @returns GlobalResponse indicating logout success
     */
    @Post('logOutUser')
    async logOutUser(@Body() reqModel: LogoutUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.logOutUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Update user profile information
     * @param reqModel - User update data
     * @returns GlobalResponse indicating update success
     */
    @Post('updateUser')
    async updateUser(@Body() reqModel: UpdateUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Delete user account
     * @param reqModel - Delete request with user email
     * @returns GlobalResponse indicating deletion success
     */
    @Post('deleteUser')
    async deleteUser(@Body() reqModel: DeleteUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Retrieve all users for a company
     * @param reqModel - Request with company ID
     * @returns GetAllUsersModel with list of users
     */
    @Post('getAllUsers')
    async getAllUsers(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllUsersModel> {
        try {
            return await this.service.getAllUsers(reqModel);
        } catch (error) {
            return returnException(GetAllUsersModel, error);
        }
    }

    /**
     * Send access request email to administrators
     * Public endpoint - no authentication required
     * @param reqModel - Access request details
     * @returns GlobalResponse indicating email sent successfully
     */
    @Post('requestAccess')
    @Public()
    async requestAccess(@Body() reqModel: RequestAccessModel): Promise<GlobalResponse> {
        try {
            return await this.service.requestAccess(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
