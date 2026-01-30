import { GlobalResponse } from '../common/global-response';
import { UserRoleEnum } from '../enums';

export class RegisterUserModel {
    fullName: string;
    companyId: number;
    email: string;
    phNumber: string;
    password: string;
    role?: UserRoleEnum;

    constructor(fullName: string, companyId: number, email: string, phNumber: string, password: string, role?: UserRoleEnum) {
        this.fullName = fullName;
        this.companyId = companyId;
        this.email = email;
        this.phNumber = phNumber;
        this.password = password;
        this.role = role;
    }
}

export class UpdateUserModel {
    id: number;
    fullName?: string;
    companyId?: number;
    email?: string;
    phNumber?: string;
    password?: string;
    role?: UserRoleEnum;

    constructor(id: number, fullName?: string, companyId?: number, email?: string, phNumber?: string, password?: string, role?: UserRoleEnum) {
        this.id = id;
        this.fullName = fullName;
        this.companyId = companyId;
        this.email = email;
        this.phNumber = phNumber;
        this.password = password;
        this.role = role;
    }
}

export class DeleteUserModel {
    email: string;
    constructor(email: string) {
        this.email = email;
    }
}

export class LoginUserModel {
    email: string;
    password: string;
    latitude?: number;
    longitude?: number;

    constructor(email: string, password: string, latitude?: number, longitude?: number) {
        this.email = email;
        this.password = password;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

export class ForgotPasswordModel {
    email: string;
    constructor(email: string) {
        this.email = email;
    }
}

export class LogoutUserModel {
    email: string;
    token: string;

    constructor(email: string, token: string) {
        this.email = email;
        this.token = token;
    }
}

export class ResetPasswordModel {
    email: string;
    newPassword: string;

    constructor(email: string, newPassword: string) {
        this.email = email;
        this.newPassword = newPassword;
    }
}

export class VerifyEmailModel {
    token: string;
    constructor(token: string) {
        this.token = token;
    }
}

export class RefreshTokenModel {
    refreshToken: string;
    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
    }
}

export class RefreshTokenResponseModel {
    accessToken: string;
    refreshToken: string;
    constructor(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}

export class UserResponseModel {
    id: number;
    fullName: string;
    companyId: number;
    email: string;
    phNumber: string;
    role: UserRoleEnum;

    constructor(id: number, fullName: string, companyId: number, email: string, phNumber: string, role: UserRoleEnum) {
        this.id = id;
        this.fullName = fullName;
        this.companyId = companyId;
        this.email = email;
        this.phNumber = phNumber;
        this.role = role;
    }
}

export class LoginResponseModel extends GlobalResponse {
    userInfo: UserResponseModel
    accessToken: string;
    refreshToken: string;
    constructor(status: boolean, code: number, message: string, userInfo: UserResponseModel, accessToken: string, refreshToken: string) {
        super(status, code, message);
        this.userInfo = userInfo;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}

export class GetAllUsersModel extends GlobalResponse {
    users: IAMUser[]
    constructor(status: boolean, code: number, message: string, users: IAMUser[]) {
        super(status, code, message);
        this.users = users;
    }
}

// --- Interfaces for UI ---
export interface IAMUser {
    id: number;
    fullName: string;
    email: string;
    phNumber?: string;
    companyId: number;
    userRole: string;
    status: boolean;
    lastLogin?: Date;
    roles?: any[];
    createdAt: Date;
    updatedAt: Date;
}