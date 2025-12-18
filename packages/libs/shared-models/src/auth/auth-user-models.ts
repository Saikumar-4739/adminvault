import { GlobalResponse } from '@adminvault/backend-utils';
import { UserRoleEnum } from '../enums';

export class RegisterUserModel {
    fullName: string;
    companyId: number;
    email: string;
    phNumber: string;
    password: string;
    role?: UserRoleEnum
    constructor(fullName: string, companyId: number, email: string, phNumber: string, password: string, role?: UserRoleEnum) {
        this.fullName = fullName;
        this.companyId = companyId;
        this.email = email;
        this.phNumber = phNumber;
        this.password = password;
        this.role = role;
    }
}

export class UpdateUserModel extends RegisterUserModel {
    id: number;
    constructor(id: number, fullName: string, companyId: number, email: string, phNumber: string, password: string) {
        super(fullName, companyId, email, phNumber, password);
        this.id = id;
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
    token: string;
    newPassword: string;
    constructor(token: string, newPassword: string) {
        this.token = token;
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

export class LoginResponseModel extends GlobalResponse {
    userInfo: RegisterUserModel
    accessToken: string;
    refreshToken: string;
    constructor(status: boolean, code: number, message: string, userInfo: RegisterUserModel, accessToken: string, refreshToken: string) {
        super(status, code, message);
        this.userInfo = userInfo;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}

export class GetAllUsersModel extends GlobalResponse {
    users: RegisterUserModel[]
    constructor(status: boolean, code: number, message: string, users: RegisterUserModel[]) {
        super(status, code, message);
        this.users = users;
    }
}

export class IdRequestModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class CompanyIdRequestModel {
    id: number;
    name?: string;
    constructor(id: number, name?: string) {
        this.id = id;
        this.name = name;
    }
}