import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthUsersRepository } from '../../repository/auth-users.repository';
import { AuthUsersEntity } from '../../entities/auth-users.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, CreateLoginSessionModel } from '@adminvault/shared-models';
import { UserRoleEnum } from '@adminvault/shared-models';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { LoginSessionService } from './login-session.service';
import { MailService } from '../mail/mail.service';
import { RequestAccessModel } from '@adminvault/shared-models';


const SECRET_KEY = "2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724";
const REFRESH_SECRET_KEY = "d9f8a1ec2d6826db2f24ea9f8a1d9bda26f054de88bb90b63934561f7225ab";

@Injectable()
export class AuthUsersService {
    constructor(
        private dataSource: DataSource,
        private authUsersRepo: AuthUsersRepository,
        private loginSessionService: LoginSessionService,
        private mailService: MailService,
        private jwtService: JwtService
    ) { }

    //Helper
    private generateAccessToken(payload: any): string {
        return this.jwtService.sign(payload);
    }

    //Helper
    private generateRefreshToken(payload: any): string {
        return this.jwtService.sign(payload, { secret: REFRESH_SECRET_KEY, expiresIn: '7d' });
    }

    //login User As per Role Based
    async loginUser(reqModel: LoginUserModel, req?: any): Promise<LoginResponseModel> {
        try {
            if (reqModel.latitude && reqModel.longitude) {
                // GPS coordinates provided
            }

            const user = await this.authUsersRepo.findOne({ where: { email: reqModel.email } });
            if (!user) {
                if (req) {
                    await this.trackFailedLogin(req, reqModel.email, 'email_not_found', undefined, undefined, reqModel.latitude, reqModel.longitude);
                }
                throw new ErrorResponse(0, "Email does not exist");
            }

            const isPasswordMatch = await bcrypt.compare(reqModel.password, user.passwordHash);
            if (!isPasswordMatch) {
                if (req) {
                    await this.trackFailedLogin(req, reqModel.email, 'invalid_password', user.id, user.companyId, reqModel.latitude, reqModel.longitude);
                }
                throw new ErrorResponse(0, "Invalid password");
            }

            const payload = {
                username: user.email,
                email: user.email, // Explicitly add email for JwtStrategy
                sub: user.id,
                companyId: user.companyId
            };
            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken({ ...payload, sub: user.id });

            if (req) {
                try {
                    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
                    const userAgent = req.headers['user-agent'];

                    const loginSessionModel = new CreateLoginSessionModel();
                    loginSessionModel.userId = user.id;
                    loginSessionModel.companyId = user.companyId;
                    loginSessionModel.ipAddress = ipAddress;
                    loginSessionModel.userAgent = userAgent;
                    loginSessionModel.loginMethod = 'email_password';
                    loginSessionModel.sessionToken = accessToken; // Store JWT

                    // Add location data
                    if (reqModel.latitude && reqModel.longitude) {
                        loginSessionModel.latitude = reqModel.latitude;
                        loginSessionModel.longitude = reqModel.longitude;
                    }

                    await this.loginSessionService.createLoginSession(loginSessionModel);
                } catch (sessionError) {
                    throw sessionError;
                }
            }
            const userInfo = new RegisterUserModel(user.fullName, user.companyId, user.email, user.phNumber, user.passwordHash, user.userRole);
            return new LoginResponseModel(true, 0, "User Logged In Successfully", userInfo, accessToken, refreshToken);
        } catch (err) {
            throw err;
        }
    }

    async requestAccess(reqModel: RequestAccessModel): Promise<GlobalResponse> {
        try {
            await this.mailService.sendAccessRequestEmail(reqModel);
            return new GlobalResponse(true, 0, "Access request sent successfully");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Track failed login attempts for security monitoring
     */
    private async trackFailedLogin(req: any, email: string, reason: string, userId?: number, companyId?: number, latitude?: number, longitude?: number): Promise<void> {
        try {
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
            const userAgent = req.headers['user-agent'];

            await this.loginSessionService.createFailedLoginAttempt({ userId: userId || 0, companyId: companyId || 0, ipAddress, userAgent, loginMethod: 'email_password', failureReason: reason, attemptedEmail: email, latitude, longitude });
        } catch (error) {
            throw error;
        }
    }

    //logOut User
    async logOutUser(reqModel: LogoutUserModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.findOne({ where: { email: reqModel.email } });
            if (!existingUser) {
                throw new ErrorResponse(0, "Email does not exist");
            }
            await transManager.startTransaction();
            await this.authUsersRepo.update({ email: reqModel.email }, { lastLogin: new Date() })
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "User Logged Out Successfully");
        } catch (err) {
            await transManager.releaseTransaction();
            throw err;
        }
    }

    //update user
    async updateUser(reqModel: UpdateUserModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.findOne({ where: { email: reqModel.email } });
            if (!existingUser) {
                throw new ErrorResponse(0, "Email does not exist");
            }
            await transManager.startTransaction();
            await this.authUsersRepo.update({ email: reqModel.email }, { fullName: reqModel.fullName, phNumber: reqModel.phNumber })
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "User Logged Out Successfully");
        } catch (err) {
            await transManager.releaseTransaction();
            throw err;
        }
    }

    //delete user
    async deleteUser(reqModel: DeleteUserModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.findOne({ where: { email: reqModel.email } });
            if (!existingUser) {
                throw new ErrorResponse(0, "Email does not exist");
            }
            await transManager.startTransaction();
            await this.authUsersRepo.delete({ email: reqModel.email })
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "User Logged Out Successfully");
        } catch (err) {
            await transManager.releaseTransaction();
            throw err;
        }
    }

    //get all users
    async getAllUsers(reqModel: CompanyIdRequestModel): Promise<GetAllUsersModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.find({ where: { companyId: reqModel.id } });
            if (!existingUser) {
                throw new ErrorResponse(0, "Email does not exist");
            }

            const users = existingUser.map(user => new RegisterUserModel(user.fullName, user.companyId, user.email, user.phNumber, user.passwordHash, user.userRole));
            return new GetAllUsersModel(true, 0, "User Logged Out Successfully", users);
        } catch (err) {
            await transManager.releaseTransaction();
            throw err;
        }
    }

}
