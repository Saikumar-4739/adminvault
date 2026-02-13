import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { AuthUsersRepository } from './repositories/auth-users.repository';
import { AuthTokensRepository } from './repositories/auth-tokens.repository';
import { AuthUsersEntity } from './entities/auth-users.entity';
import { AuthTokensEntity } from './entities/auth-tokens.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel, UserResponseModel } from '@adminvault/shared-models';
import { UserRoleEnum } from '@adminvault/shared-models';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { EmailInfoService } from '../administration/email-info.service';
import { ForgotPasswordModel, ResetPasswordModel, RequestAccessModel, SendPasswordResetEmailModel } from '@adminvault/shared-models';
import { Request } from 'express';
import { IUserPayload } from '../../interfaces/auth.interface';

const DEFAULT_MENUS = [
    {
        key: 'main',
        label: 'Main',
        icon: 'LayoutGrid',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN],
        children: [
            { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'masters', label: 'Masters', icon: 'Settings2', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'reports', label: 'Reports', icon: 'BarChart3', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN] },
        ]
    },
    {
        key: 'resources',
        label: 'Resources',
        icon: 'Library',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN],
        children: [
            { key: 'employees', label: 'Employees', icon: 'Users', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'assets', label: 'Assets', icon: 'Laptop', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'procurement', label: 'Procurement', icon: 'ShoppingCart', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'licenses', label: 'Licenses', icon: 'Key', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'emails', label: 'Emails', icon: 'Mail', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SITE_ADMIN] },
        ]
    },
    {
        key: 'global-identity',
        label: 'Global Routing & Identity',
        icon: 'Globe',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.SITE_ADMIN],
        children: [
            { key: 'network', label: 'Network', icon: 'Network', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'approvals', label: 'Approvals', icon: 'CheckSquare', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.SITE_ADMIN] },
        ]
    },
    {
        key: 'account',
        label: 'Account',
        icon: 'UserCircle',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN],
        children: [
            { key: 'profile', label: 'Profile', icon: 'UserCircle', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'knowledge-base', label: 'Help', icon: 'BookOpen', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN] },
        ]
    },
    {
        key: 'support',
        label: 'Support',
        icon: 'HelpCircle',
        roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN],
        children: [
            { key: 'tickets', label: 'Support Tickets', icon: 'Ticket', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN] },
            { key: 'create-ticket', label: 'Create Ticket', icon: 'PlusCircle', roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.USER, UserRoleEnum.VIEWER, UserRoleEnum.SUPPORT_ADMIN, UserRoleEnum.SITE_ADMIN] },
        ]
    },
];

const SECRET_KEY = process.env.JWT_SECRET_KEY || (() => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET_KEY must be set in production environment');
    }
    return "2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724";
})();

const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || (() => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_REFRESH_SECRET_KEY must be set in production environment');
    }
    return "d9f8a1ec2d6826db2f24ea9f8a1d9bda26f054de88bb90b63934561f7225ab";
})();


@Injectable()
export class AuthUsersService {
    constructor(
        private dataSource: DataSource,
        private authUsersRepo: AuthUsersRepository,
        private authTokensRepo: AuthTokensRepository,
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

            await transManager.startTransaction()

            const passwordHash = await bcrypt.hash(reqModel.password, 10)

            const newUser = new AuthUsersEntity()
            newUser.email = reqModel.email
            newUser.fullName = reqModel.fullName
            newUser.phNumber = reqModel.phNumber
            newUser.companyId = reqModel.companyId
            newUser.passwordHash = passwordHash
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
    private generateAccessToken(payload: IUserPayload | object): string {
        return this.jwtService.sign(payload);
    }

    /**
     * Generate JWT refresh token for authenticated user
     * Refresh token expires in 7 days and uses separate secret key
     * 
     * @param payload - Token payload containing user information
     * @returns Signed JWT refresh token with 7-day expiration
     */
    private generateRefreshToken(payload: IUserPayload | object): string {
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
    async loginUser(reqModel: LoginUserModel, req?: Request): Promise<LoginResponseModel> {
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
                companyId: user.companyId,
                role: user.userRole
            };
            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken({ ...payload, sub: user.id });

            // Store refresh token in database
            const tokenEntity = new AuthTokensEntity();
            tokenEntity.userId = user.id;
            tokenEntity.token = refreshToken;
            tokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await this.authTokensRepo.save(tokenEntity);

            const menus = this.getMenusForRole(user.userRole);

            const userInfo = new UserResponseModel(user.id, user.fullName, user.companyId, user.email, user.phNumber, user.userRole);
            return new LoginResponseModel(true, 0, "User Logged In Successfully", userInfo, accessToken, refreshToken, menus);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Refresh access token using a valid, non-revoked refresh token
     * 
     * @param refreshToken - The refresh token provided by the client
     * @returns New access token and refresh token
     * @throws ErrorResponse if token is invalid, expired, or revoked
     */
    async refreshToken(refreshToken: string): Promise<LoginResponseModel> {
        try {
            // Verify refresh token signature and expiration
            let decoded: any;
            try {
                decoded = this.jwtService.verify(refreshToken, { secret: REFRESH_SECRET_KEY });
            } catch (err) {
                throw new ErrorResponse(401, "Invalid or expired refresh token");
            }

            // Check if token exists in DB and is not revoked
            const tokenRecord = await this.authTokensRepo.findOne({ where: { token: refreshToken, isRevoked: false } });
            if (!tokenRecord) {
                throw new ErrorResponse(401, "Token has been revoked or is invalid");
            }

            // Get user info
            const user = await this.authUsersRepo.findOne({ where: { id: decoded.sub } });
            if (!user || user.status === false) {
                throw new ErrorResponse(401, "User no longer active");
            }

            const payload = {
                username: user.email,
                email: user.email,
                sub: user.id,
                companyId: user.companyId,
                role: user.userRole
            };

            const newAccessToken = this.generateAccessToken(payload);
            const newRefreshToken = this.generateRefreshToken({ ...payload, sub: user.id });

            // Revoke old token and save new one
            tokenRecord.isRevoked = true;
            await this.authTokensRepo.save(tokenRecord);

            const newTokenEntity = new AuthTokensEntity();
            newTokenEntity.userId = user.id;
            newTokenEntity.token = newRefreshToken;
            newTokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await this.authTokensRepo.save(newTokenEntity);

            const userInfo = new UserResponseModel(user.id, user.fullName, user.companyId, user.email, user.phNumber, user.userRole);
            return new LoginResponseModel(true, 0, "Token Refreshed Successfully", userInfo, newAccessToken, newRefreshToken);
        } catch (err) {
            throw err;
        }
    }

    /**
     * Verify user password for sensitive operations (e.g. accessing Password Vault)
     * 
     * @param userId - ID of the user to verify
     * @param password - Password to check
     * @returns Boolean indicating if password is valid
     */
    async verifyPassword(userId: number, password: string): Promise<boolean> {
        try {
            const user = await this.authUsersRepo.findOne({ where: { id: userId } });
            if (!user) {
                throw new ErrorResponse(0, "User not found");
            }
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            return isMatch;
        } catch (error) {
            throw error;
        }
    }

    private extractClientIp(req: Request): string {
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
            const success = await this.emailService.sendAccessRequestEmail(reqModel);
            if (!success) {
                throw new ErrorResponse(0, "Failed to send access request email. Please try again later.");
            }
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
    private async trackFailedLogin(req: Request, email: string, reason: string, userId?: number, companyId?: number, latitude?: number, longitude?: number): Promise<void> {
        // Session tracking removed
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
            // Revoke all tokens for this user on logout
            await this.authTokensRepo.revokeAllTokensForUser(existingUser.id);
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

            const updateData: Partial<AuthUsersEntity> = {};
            if (reqModel.fullName) updateData.fullName = reqModel.fullName;
            if (reqModel.phNumber) updateData.phNumber = reqModel.phNumber;
            if (reqModel.role) updateData.userRole = reqModel.role as any;
            if (reqModel.companyId) updateData.companyId = reqModel.companyId;
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
            const existingUser = await this.authUsersRepo.find({ where: { companyId: reqModel.companyId } });
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
            const success = await this.emailService.sendPasswordResetEmail(new SendPasswordResetEmailModel(user.email, token));
            if (!success) {
                throw new ErrorResponse(0, "Failed to send password reset email. Please try again later.");
            }

            return new GlobalResponse(true, 200, "Password reset instructions sent.");
        } catch (error) {
            throw error;
        }
    }

    async resetPassword(model: ResetPasswordModel): Promise<GlobalResponse> {
        try {
            const user = await this.authUsersRepo.findOne({
                where: {
                    email: model.email
                }
            });

            if (!user) {
                throw new ErrorResponse(400, "User email not found.");
            }

            user.passwordHash = await bcrypt.hash(model.newPassword, 10);
            // Optionally clear reset token fields if they were used in a mixed flow, though not strictly necessary here
            user.resetToken = null;
            user.resetTokenExpiry = null;
            await this.authUsersRepo.save(user);

            return new GlobalResponse(true, 200, "Password has been reset successfully.");
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validate and link/create user based on Google OAuth profile
     * 
     * @param googleProfile - Profile data returned by Google OAuth
     * @returns User entity
     */
    async validateGoogleUser(googleProfile: any): Promise<AuthUsersEntity> {
        const { googleId, email, firstName, lastName, picture } = googleProfile;

        let user = await this.authUsersRepo.findOne({ where: [{ googleId }, { email }] });

        if (!user) {
            // Create new user if not found by Google ID or Email
            user = new AuthUsersEntity();
            user.email = email;
            user.fullName = `${firstName} ${lastName}`;
            user.googleId = googleId;
            user.picture = picture;
            user.status = true;
            user.userRole = UserRoleEnum.USER;
            user.companyId = 1; // Default company ID, should ideally be handled better
            user.employeeId = `EMP-G-${Date.now()}`;
            await this.authUsersRepo.save(user);
        } else {
            // Update existing user with Google ID and picture if not already set
            let changed = false;
            if (!user.googleId) {
                user.googleId = googleId;
                changed = true;
            }
            if (!user.picture) {
                user.picture = picture;
                changed = true;
            }
            if (changed) {
                await this.authUsersRepo.save(user);
            }
        }

        return user;
    }

    /**
     * Authenticate user after successful OAuth and return tokens
     * 
     * @param user - Authenticated user entity
     * @returns LoginResponseModel with user info and tokens
     */
    async loginUserFromOAuth(user: AuthUsersEntity): Promise<LoginResponseModel> {
        const payload = {
            username: user.email,
            email: user.email,
            sub: user.id,
            companyId: user.companyId,
            role: user.userRole
        };
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken({ ...payload, sub: user.id });

        // Store refresh token in database
        const tokenEntity = new AuthTokensEntity();
        tokenEntity.userId = user.id;
        tokenEntity.token = refreshToken;
        tokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await this.authTokensRepo.save(tokenEntity);

        const menus = this.getMenusForRole(user.userRole);

        const userInfo = new UserResponseModel(user.id, user.fullName, user.companyId, user.email, user.phNumber, user.userRole);
        return new LoginResponseModel(true, 0, "User Logged In via OAuth Successfully", userInfo, accessToken, refreshToken, menus);
    }

    /**
     * Get user profile and menus by ID
     * 
     * @param userId - User ID
     * @returns LoginResponseModel with user info and menus
     */
    async getMe(userId: number): Promise<LoginResponseModel> {
        try {
            const user = await this.authUsersRepo.findOne({ where: { id: userId } });
            if (!user) {
                throw new ErrorResponse(404, "User not found");
            }

            const menus = this.getMenusForRole(user.userRole);
            const userInfo = new UserResponseModel(user.id, user.fullName, user.companyId, user.email, user.phNumber, user.userRole);

            return new LoginResponseModel(true, 0, "Profile retrieved successfully", userInfo, undefined, undefined, menus);
        } catch (error) {
            throw error;
        }
    }

    private getMenusForRole(role: string): any[] {
        // Super Admin gets everything
        if (role === UserRoleEnum.SUPER_ADMIN || role === UserRoleEnum.SITE_ADMIN) {
            return DEFAULT_MENUS.map(m => ({
                ...m,
                permissions: { create: true, read: true, update: true, delete: true, scopes: ['*'] },
                children: m.children?.map(c => ({
                    ...c,
                    permissions: { create: true, read: true, update: true, delete: true, scopes: ['*'] }
                }))
            }));
        }

        const fullPermissions = { create: true, read: true, update: true, delete: true };
        const readOnlyPermissions = { create: false, read: true, update: false, delete: false };

        const filterMenus = (menus: any[]): any[] => {
            return menus
                .filter(m => m.roles.includes(role))
                .map(m => {
                    const permissions = (role === UserRoleEnum.ADMIN) ? fullPermissions : readOnlyPermissions;
                    const children = m.children ? filterMenus(m.children) : undefined;
                    return { ...m, permissions, children };
                });
        };

        return filterMenus(DEFAULT_MENUS);
    }
}
