import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuthUsersRepository } from '../../repository/auth-users.repository';
import { AuthUsersEntity } from '../../entities/auth-users.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CompanyIdRequestModel, DeleteUserModel, GetAllUsersModel, LoginResponseModel, LoginUserModel, LogoutUserModel, RegisterUserModel, UpdateUserModel } from '@adminvault/shared-models';
import { UserRoleEnum } from '@adminvault/shared-models';
import * as bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';


const SECRET_KEY = "2c6ee24b09816a6c6de4f1d3f8c3c0a6559dca86b6f710d930d3603fdbb724";
const REFRESH_SECRET_KEY = "d9f8a1ec2d6826db2f24ea9f8a1d9bda26f054de88bb90b63934561f7225ab";

@Injectable()
export class AuthUsersService {
    constructor(
        private dataSource: DataSource,
        private authUsersRepo: AuthUsersRepository
    ) { }

    //Create User
    async registerUser(reqModel: RegisterUserModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource)
        try {
            const existingUser = this.authUsersRepo.find({ where: { email: reqModel.email } })
            if (!existingUser) {
                throw new ErrorResponse(0, "Email already exists")
            }

            if (!reqModel.companyId) {
                throw new ErrorResponse(0, "Company ID is required")
            }

            if (reqModel.password.length < 8) {
                throw new ErrorResponse(0, "Password must be at least 8 characters long")
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

    //Helper
    private generateAccessToken(userId: string): string {
        return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
    }

    //Helper
    private generateRefreshToken(userId: string): string {
        return jwt.sign({ userId }, REFRESH_SECRET_KEY, { expiresIn: '7d' });
    }

    //login User As per Role Based
    async loginUser(reqModel: LoginUserModel): Promise<LoginResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.find({ where: { email: reqModel.email } });
            if (!existingUser || existingUser.length === 0) {
                throw new ErrorResponse(0, "Email does not exist");
            }

            const user = existingUser[0];
            const isPasswordMatch = await bcrypt.compare(reqModel.password, user.passwordHash);
            if (!isPasswordMatch) {
                throw new ErrorResponse(0, "Invalid password");
            }

            // Generate tokens
            const accessToken = this.generateAccessToken(user.email);
            const refreshToken = this.generateRefreshToken(user.email);
            const userInfo = new RegisterUserModel(user.fullName, user.companyId, user.email, user.phNumber, user.passwordHash, user.userRole);
            return new LoginResponseModel(true, 0, "User Logged In Successfully", userInfo, accessToken, refreshToken);
        } catch (err) {
            throw err;
        }
    }

    //logOut User
    async logOutUser(reqModel: LogoutUserModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingUser = await this.authUsersRepo.find({ where: { email: reqModel.email } });
            if (!existingUser || existingUser.length === 0) {
                throw new ErrorResponse(0, "Email does not exist");
            }
            await transManager.startTransaction();
            await this.authUsersRepo.update({ email: reqModel.email }, { lastLogin: Date.now() })
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
            const existingUser = await this.authUsersRepo.find({ where: { email: reqModel.email } });
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
            const existingUser = await this.authUsersRepo.find({ where: { email: reqModel.email } });
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
