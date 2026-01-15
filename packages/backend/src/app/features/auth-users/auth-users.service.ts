import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DataSource, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { AuthUsersRepository } from './repositories/auth-users.repository';
import { AuthUsersEntity } from './entities/auth-users.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, CreateLoginSessionModel } from '@adminvault/shared-models';
import { UserRoleEnum } from '@adminvault/shared-models';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { LoginSessionService } from './login-session.service';
import { EmailInfoService } from '../administration/email-info.service';
import { ForgotPasswordModel, ResetPasswordModel, RequestAccessModel } from '@adminvault/shared-models';
import axios from 'axios';
import { URLSearchParams } from 'url';

// JWT Configuration - Load from environment variables
const SECRET_KEY = process.env.JWT_SECRET_KEY || (() => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET_KEY must be set in production environment');
    }
    console.warn('⚠️  WARNING: Using default JWT_SECRET_KEY. Set JWT_SECRET_KEY in .env for production!');
    return "2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724";
})();

const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || (() => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_REFRESH_SECRET_KEY must be set in production environment');
    }
    console.warn('⚠️  WARNING: Using default JWT_REFRESH_SECRET_KEY. Set JWT_REFRESH_SECRET_KEY in .env for production!');
    return "d9f8a1ec2d6826db2f24ea9f8a1d9bda26f054de88bb90b63934561f7225ab";
})();

// SSO Configuration - Load from environment variables
interface SSOProviderConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    userInfoUrl: string;
    scope: string;
    authUrl: string | ((tenantId: string) => string);
    tokenUrl: string | ((tenantId: string) => string);
    tenantId?: string;
}

interface SSOConfig {
    microsoft: SSOProviderConfig;
    google: SSOProviderConfig;
}

const getSSOConfig = (): SSOConfig => {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const apiPrefix = '/api'; // Assuming global prefix is 'api'

    return {
        microsoft: {
            clientId: process.env.MICROSOFT_CLIENT_ID || '',
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
            tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
            redirectUri: process.env.MICROSOFT_REDIRECT_URI || `${backendUrl}${apiPrefix}/auth-users/sso/callback`,
            authUrl: (tenantId: string) => `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
            tokenUrl: (tenantId: string) => `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
            userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
            scope: 'openid profile email User.Read'
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            redirectUri: process.env.GOOGLE_REDIRECT_URI || `${backendUrl}${apiPrefix}/auth-users/sso/callback`,
            authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
            scope: 'openid profile email'
        }
    };
};

@Injectable()
export class AuthUsersService {
    constructor(
        private dataSource: DataSource,
        private authUsersRepo: AuthUsersRepository,
        private loginSessionService: LoginSessionService,
        @Inject(forwardRef(() => EmailInfoService))
        private emailService: EmailInfoService,
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

            if (!reqModel.companyId || reqModel.companyId <= 0) {
                throw new ErrorResponse(0, "Invalid company ID")
            }

            // Password check only for LOCAL users
            const isLocal = !reqModel.authType || reqModel.authType === 'LOCAL';
            if (isLocal && (reqModel.password?.length < 8)) {
                throw new ErrorResponse(0, "Password must be at least 8 characters")
            }

            await transManager.startTransaction()

            // Password logic: generate a complex random password for SSO users
            const effectivePassword = isLocal
                ? reqModel.password
                : Math.random().toString(36).slice(-16) + 'SSO!';

            const passwordHash = await bcrypt.hash(effectivePassword, 10)

            const newUser = new AuthUsersEntity()
            newUser.email = reqModel.email
            newUser.fullName = reqModel.fullName
            newUser.phNumber = reqModel.phNumber
            newUser.companyId = reqModel.companyId
            newUser.passwordHash = passwordHash
            newUser.authType = reqModel.authType || 'LOCAL'
            newUser.userRole = reqModel.role || UserRoleEnum.USER
            newUser.status = true
            newUser.employeeId = `EMP-${Date.now()}` // Default employee ID if not provided
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
            await this.emailService.sendAccessRequestEmail(reqModel);
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
            let existingUser;
            if (reqModel.id) {
                existingUser = await this.authUsersRepo.findOne({ where: { id: reqModel.id } });
            } else if (reqModel.email) {
                existingUser = await this.authUsersRepo.findOne({ where: { email: reqModel.email } });
            }

            if (!existingUser) {
                throw new ErrorResponse(0, "User does not exist");
            }

            await transManager.startTransaction();

            const updateData: any = {};
            if (reqModel.fullName) updateData.fullName = reqModel.fullName;
            if (reqModel.phNumber) updateData.phNumber = reqModel.phNumber;
            // Handle other fields if necessary

            if (Object.keys(updateData).length > 0) {
                await this.authUsersRepo.update({ id: existingUser.id }, updateData);
            }

            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "User Updated Successfully");
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

            const users = existingUser.map(user => ({
                id: user.id,
                fullName: user.fullName,
                companyId: user.companyId,
                email: user.email,
                phNumber: user.phNumber,
                userRole: user.userRole,
                status: user.status,
                lastLogin: user.lastLogin,
                roles: [],
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));
            return new GetAllUsersModel(true, 0, "Users Retrieved Successfully", users);
        } catch (err) {
            await transManager.releaseTransaction();
            throw err;
        }
    }

    /**
     * Generate SSO authorization URL for supported providers
     * Creates OAuth 2.0 authorization URL with proper parameters
     * 
     * @param provider - SSO provider (microsoft or google)
     * @returns Authorization URL to redirect user to
     * @throws ErrorResponse if provider is invalid or not configured
     */
    async getSSOAuthUrl(provider: 'microsoft' | 'google'): Promise<string> {
        const config = getSSOConfig()[provider];
        if (!config) throw new ErrorResponse(0, 'Invalid Provider');

        // Validate that provider is configured
        if (!config.clientId || !config.clientSecret) {
            throw new ErrorResponse(0, `${provider} SSO is not configured. Please set environment variables.`);
        }

        const params = new URLSearchParams({
            client_id: config.clientId,
            response_type: 'code',
            redirect_uri: config.redirectUri,
            scope: config.scope,
            state: provider // Pass provider as state to identify during callback
        });

        // Provider-specific parameters
        if (provider === 'google') {
            params.append('access_type', 'offline');
            params.append('prompt', 'consent');
        }

        const authUrl = provider === 'microsoft' && typeof config.authUrl === 'function'
            ? config.authUrl(config.tenantId || 'common')
            : (config.authUrl as string);

        return `${authUrl}?${params.toString()}`;
    }

    /**
     * Handle SSO callback and authenticate user
     * Exchanges authorization code for access token and retrieves user profile
     * 
     * @param provider - SSO provider name
     * @param code - Authorization code from provider
     * @param ipAddress - Client IP address
     * @param userAgent - Client user agent string
     * @returns LoginResponseModel with user info and JWT tokens
     * @throws ErrorResponse if authentication fails or user not found
     */
    async handleSSOCallback(provider: string, code: string, ipAddress: string, userAgent: string): Promise<LoginResponseModel> {
        const config = getSSOConfig()[provider as 'microsoft' | 'google'];
        if (!config) throw new ErrorResponse(0, 'Invalid Provider');

        let email = '';
        let name = '';
        let ssoId = '';

        try {
            // 1. Exchange Code for Token
            const tokenParams = new URLSearchParams({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                code: code,
                redirect_uri: config.redirectUri,
                grant_type: 'authorization_code'
            });

            const tokenUrl = provider === 'microsoft' && typeof config.tokenUrl === 'function'
                ? config.tokenUrl(config.tenantId || 'common')
                : (config.tokenUrl as string);

            const tokenRes = await axios.post(tokenUrl, tokenParams.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const accessToken = tokenRes.data.access_token;

            // 2. Get User Profile based on provider
            if (provider === 'microsoft') {
                const profileRes = await axios.get(config.userInfoUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                const upn = profileRes.data.userPrincipalName;
                const mail = profileRes.data.mail;
                name = profileRes.data.displayName;
                ssoId = profileRes.data.id;

                // Priority 1: Use 'mail' if available (it's usually the clean email)
                if (mail) {
                    email = mail;
                } else if (upn) {
                    // Priority 2: Use UPN, but handle guest users (#EXT#)
                    if (upn.includes('#EXT#')) {
                        const guestParts = upn.split('#EXT#')[0];
                        // Microsoft encodes @ as _ in the prefix of guest UPNs
                        if (guestParts.includes('_')) {
                            const lastUnderscoreIndex = guestParts.lastIndexOf('_');
                            email = guestParts.substring(0, lastUnderscoreIndex) + '@' + guestParts.substring(lastUnderscoreIndex + 1);
                        } else {
                            email = upn;
                        }
                    } else {
                        email = upn;
                    }
                }
            } else if (provider === 'google') {
                const profileRes = await axios.get(config.userInfoUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                email = profileRes.data.email;
                name = profileRes.data.name;
                ssoId = profileRes.data.sub || profileRes.data.id;
            }

            if (!email) throw new Error('Could not retrieve email from provider');

            // 3. Find or reject user (security: only allow existing users)
            let user = await this.authUsersRepo.findOne({ where: { email } });

            if (!user) {
                throw new ErrorResponse(0, `User with email ${email} not found. Please request access first.`);
            }

            // Update user details from SSO if not already linked
            user.ssoId = ssoId;
            user.authType = 'SSO';
            user.lastLogin = new Date();
            await this.authUsersRepo.save(user);

            // 4. Create Session and Generate Tokens
            const payload = {
                username: user.email,
                email: user.email,
                sub: user.id,
                companyId: user.companyId
            };
            const appAccessToken = this.generateAccessToken(payload);
            const appRefreshToken = this.generateRefreshToken({ ...payload, sub: user.id });

            // 5. Track login session
            if (ipAddress) {
                try {
                    const loginSessionModel = new CreateLoginSessionModel(
                        user.id,
                        user.companyId,
                        ipAddress,
                        userAgent,
                        provider,
                        appAccessToken,
                        0,
                        0
                    );
                    await this.loginSessionService.createLoginSession(loginSessionModel);
                } catch (sessionError) {
                    console.error('SSO Session Error:', sessionError);
                }
            }

            const userInfo = new RegisterUserModel(user.fullName, user.companyId, user.email, user.phNumber, user.passwordHash, user.userRole);
            (userInfo as any).id = user.id;
            return new LoginResponseModel(true, 0, "SSO Login Successful", userInfo, appAccessToken, appRefreshToken);

        } catch (error: any) {
            console.error('SSO Error:', error.response?.data || error.message);
            if (error instanceof ErrorResponse) {
                throw error;
            }
            throw new ErrorResponse(0, 'SSO Authentication Failed: ' + (error.response?.data?.error_description || error.message));
        }
    }

    async forgotPassword(model: ForgotPasswordModel): Promise<GlobalResponse> {
        try {
            const user = await this.authUsersRepo.findOne({ where: { email: model.email } });
            if (!user) {
                // Security best practice
                return new GlobalResponse(true, 200, "If an account exists with this email, a reset instructions have been sent.");
            }

            const token = crypto.randomBytes(32).toString('hex');
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + 1);

            user.resetToken = token;
            user.resetTokenExpiry = expiry;
            await this.authUsersRepo.save(user);

            // Send Reset Email
            await this.emailService.sendPasswordResetEmail(user.email, token);

            return new GlobalResponse(true, 200, "Password reset instructions sent.");
        } catch (error) {
            throw error;
        }
    }

    async resetPassword(model: ResetPasswordModel): Promise<GlobalResponse> {
        try {
            const user = await this.authUsersRepo.findOne({
                where: {
                    resetToken: model.token,
                    resetTokenExpiry: MoreThan(new Date())
                }
            });

            if (!user) {
                throw new ErrorResponse(400, "Invalid or expired reset token.");
            }

            user.passwordHash = await bcrypt.hash(model.newPassword, 10);
            user.resetToken = null;
            user.resetTokenExpiry = null;
            await this.authUsersRepo.save(user);

            return new GlobalResponse(true, 200, "Password has been reset successfully.");
        } catch (error) {
            throw error;
        }
    }

}
