import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { LoginUserModel, RegisterUserModel, ResetPasswordModel, ForgotPasswordModel, UpdateUserModel, UserRoleEnum } from '@adminvault/shared-models';

export class LoginUserDto extends LoginUserModel {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;
}

export class RegisterUserDto extends RegisterUserModel {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsNumber()
    companyId: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    phNumber: string;

    @IsEnum(UserRoleEnum)
    role: UserRoleEnum;
}

export class ForgotPasswordDto extends ForgotPasswordModel {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordDto extends ResetPasswordModel {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    newPassword: string;
}

export class UpdateUserDto extends UpdateUserModel {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phNumber?: string;

    @IsOptional()
    @IsNumber()
    companyId?: number;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(UserRoleEnum)
    role?: UserRoleEnum;
}
export class RequestAccessModel {
    name: string;
    email: string;
    description?: string;
}

export class RequestAccessDto extends RequestAccessModel {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    description?: string;
}
