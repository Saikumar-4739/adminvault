import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthUsersRepository } from './repositories/auth-users.repository';
import { AuthUsersEntity } from './entities/auth-users.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, CreateLoginSessionModel } from '@adminvault/shared-models';
import { UserRoleEnum } from '@adminvault/shared-models';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { LoginSessionService } from './login-session.service';
import { MailService } from '../mail/mail.service';
import { RequestAccessModel } from '@adminvault/shared-models';
import { AuditLogsService } from '../audit-logs/audit-logs.service';


const SECRET_KEY = "2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724";
const REFRESH_SECRET_KEY = "d9f8a1ec2d6826db2f24ea9f8a1d9bda26f054de88bb90b63934561f7225ab";

@Injectable()
export class AuthUsersService {
    constructor(
        private dataSource: DataSource,
        private authUsersRepo: AuthUsersRepository,
        private loginSessionService: LoginSessionService,
        private mailService: MailService,
        private jwtService: JwtService,
    ) { }


    /**
     * Register a new user in the system
     * Creates a new user account with hashed password and default ADMIN role
     * 
     * @param reqModel - User registration data including email, password, full name, phone number, and company ID
     * @returns GlobalResponse indicating success or failure of user creation
     * @throws ErrorResponse if email already exists, company ID is missing, or password is less than 8 characters
     */
    async registerUser(reqModel: RegisterUserModel, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource)
        try {
            const existingUser = await this.authUsersRepo.findOne({ where: { email: reqModel.email } })
            if (existingUser) {
                throw new ErrorResponse(0, "Email already exists")
            }

            if (!reqModel.companyId || reqModel.companyId <= 0 ||  reqModel.password.length < 8) {
                throw new ErrorResponse(0, "Invalid company ID or password")
            }

            const passwordHash = await bcrypt.hash(reqModel.password, 10)
            await transManager.startTransaction()
            const newUser = new AuthUsersEntity()
            newUser.email = reqModel.email
            newUser.passwordHash = passwordHash
            newUser.fullName = reqModel.fullName
            newUser.phNumber = reqModel.phNumber
            newUser.companyId = reqModel.companyId
            newUser.userRole = UserRoleEnum.ADMIN
            newUser.status = true
            newUser.createdAt = new Date()
            newUser.updatedAt = new Date()
            const save = await transManager.getRepository(AuthUsersEntity).save(newUser)
            await transManager.completeTransaction()
            return new GlobalResponse(true, 0, "User Created Successfully")
        } catch (err) {
            await transManager.releaseTransaction()
            throw err
        }
    }

    /**
     * Generate JWT access token for authenticated user
     * Token contains user email, ID, and company ID
     * 
     * @param payload - Token payload containing user information
     * @returns Signed JWT access token
     */
    private generateAccessToken(payload: any): string {
        return this.jwtService.sign(payload);
    }

    /**
     * Generate JWT refresh token for authenticated user
     * Refresh token expires in 7 days and uses separate secret key
     * 
     * @param payload - Token payload containing user information
     * @returns Signed JWT refresh token with 7-day expiration
     */
    private generateRefreshToken(payload: any): string {
        return this.jwtService.sign(payload, { secret: REFRESH_SECRET_KEY, expiresIn: '7d' });
    }

    /**
     * Authenticate user and create login session
     * Validates credentials, generates JWT tokens, and tracks login session with IP, location, and device info
     * 
     * @param reqModel - Login credentials including email, password, and optional GPS coordinates
     * @param req - Optional Express request object for extracting IP address and user agent
     * @returns LoginResponseModel with user info, access token, and refresh token
     * @throws ErrorResponse if email doesn't exist or password is invalid (also tracks failed login attempts)
     */
    async loginUser(reqModel: LoginUserModel, req?: any): Promise<LoginResponseModel> {
        try {
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
                email: user.email,
                sub: user.id,
                companyId: user.companyId
            };
            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken({ ...payload, sub: user.id });

            if (req) {
                try {
                    const ipAddress = this.extractClientIp(req);
                    const userAgent = req.headers['user-agent'];
                    const loginSessionModel = new CreateLoginSessionModel(user.id, user.companyId, ipAddress, userAgent, 'email_password', accessToken, reqModel.latitude, reqModel.longitude);
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

    private extractClientIp(req: any): string {
        let ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress || '127.0.0.1';
        if (typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }
        if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
            ip = ip.replace('::ffff:', '');
        }
        return ip as string;
    }

    /**
     * Send access request email to administrators
     * Allows users to request access to the system via email notification
     * 
     * @param reqModel - Access request details to be sent via email
     * @returns GlobalResponse indicating success or failure of email sending
     * @throws Error if email service fails
     */
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
     * Records IP address, user agent, location, and failure reason for security analysis
     * 
     * @param req - Express request object for extracting IP and user agent
     * @param email - Email address used in failed login attempt
     * @param reason - Reason for login failure (e.g., 'email_not_found', 'invalid_password')
     * @param userId - Optional user ID if user exists
     * @param companyId - Optional company ID if user exists
     * @param latitude - Optional GPS latitude coordinate
     * @param longitude - Optional GPS longitude coordinate
     * @throws Error if session service fails to record attempt
     */
    private async trackFailedLogin(req: any, email: string, reason: string, userId?: number, companyId?: number, latitude?: number, longitude?: number): Promise<void> {
        try {
            const ipAddress = this.extractClientIp(req);
            const userAgent = req.headers['user-agent'];

            await this.loginSessionService.createFailedLoginAttempt({ userId: userId || 0, companyId: companyId || 0, ipAddress, userAgent, loginMethod: 'email_password', failureReason: reason, attemptedEmail: email, latitude, longitude });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Log out user and update last login timestamp
     * Updates the user's last login time to current timestamp
     * 
     * @param reqModel - Logout request containing user email
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if user email doesn't exist
     */
    async logOutUser(reqModel: LogoutUserModel, ipAddress?: string): Promise<GlobalResponse> {
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

    /**
     * Update user profile information
     * Updates user's full name and phone number
     * 
     * @param reqModel - Update request containing email, full name, and phone number
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if user email doesn't exist
     */
    async updateUser(reqModel: UpdateUserModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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

    /**
     * Delete user account from the system
     * Permanently removes user record from database
     * 
     * @param reqModel - Delete request containing user email
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if user email doesn't exist
     */
    async deleteUser(reqModel: DeleteUserModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.findOne({ where: { email: reqModel.email } });
            if (!existingUser) {
                throw new ErrorResponse(0, "Email does not exist");
            }
            await transManager.startTransaction();
            await this.authUsersRepo.delete({ email: reqModel.email })
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "User Deleted Successfully");
        } catch (err) {
            await transManager.releaseTransaction();
            throw err;
        }
    }

    /**
     * Retrieve all users for a specific company
     * Fetches list of all users belonging to the specified company
     * 
     * @param reqModel - Request containing company ID
     * @returns GetAllUsersModel with list of users for the company
     * @throws ErrorResponse if no users found for the company
     */
    async getAllUsers(reqModel: CompanyIdRequestModel): Promise<GetAllUsersModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.find({ where: { companyId: reqModel.id } });
            if (!existingUser) {
                throw new ErrorResponse(0, "No users found");
            }

            const users = existingUser.map(user => new RegisterUserModel(user.fullName, user.companyId, user.email, user.phNumber, user.passwordHash, user.userRole));
            return new GetAllUsersModel(true, 0, "Users Retrieved Successfully", users);
        } catch (err) {
            await transManager.releaseTransaction();
            throw err;
        }
    }

}
