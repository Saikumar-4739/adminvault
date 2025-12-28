import { GlobalResponse } from '../common/global-response';
import { AdminRoleEnum, AdminStatusEnum } from '../enums';

export class CreateItAdminModel {
    adminCode: string;
    name: string;
    email: string;
    phNumber?: string;
    roleEnum: AdminRoleEnum;
    permissions?: Record<string, any>;
    status: AdminStatusEnum;

    constructor(
        adminCode: string,
        name: string,
        email: string,
        roleEnum: AdminRoleEnum,
        status: AdminStatusEnum = AdminStatusEnum.ACTIVE,
        phNumber?: string,
        permissions?: Record<string, any>
    ) {
        this.adminCode = adminCode;
        this.name = name;
        this.email = email;
        this.roleEnum = roleEnum;
        this.status = status;
        this.phNumber = phNumber;
        this.permissions = permissions;
    }
}

export class UpdateItAdminModel extends CreateItAdminModel {
    id: number;

    constructor(
        id: number,
        adminCode: string,
        name: string,
        email: string,
        roleEnum: AdminRoleEnum,
        status: AdminStatusEnum = AdminStatusEnum.ACTIVE,
        phNumber?: string,
        permissions?: Record<string, any>
    ) {
        super(adminCode, name, email, roleEnum, status, phNumber, permissions);
        this.id = id;
    }
}

export class DeleteItAdminModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class GetItAdminModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class ItAdminResponseModel {
    id: number;
    adminCode: string;
    name: string;
    email: string;
    phNumber?: string;
    roleEnum: AdminRoleEnum;
    permissions?: Record<string, any>;
    status: AdminStatusEnum;

    constructor(
        id: number,
        adminCode: string,
        name: string,
        email: string,
        roleEnum: AdminRoleEnum,
        status: AdminStatusEnum,
        phNumber?: string,
        permissions?: Record<string, any>
    ) {
        this.id = id;
        this.adminCode = adminCode;
        this.name = name;
        this.email = email;
        this.roleEnum = roleEnum;
        this.status = status;
        this.phNumber = phNumber;
        this.permissions = permissions;
    }
}

export class GetAllItAdminsModel extends GlobalResponse {
    override admins: ItAdminResponseModel[];
    constructor(status: boolean, code: number, message: string, admins: ItAdminResponseModel[]) {
        super(status, code, message);
        this.admins = admins;
    }
}

export class GetItAdminByIdModel extends GlobalResponse {
    override admin: ItAdminResponseModel;
    constructor(status: boolean, code: number, message: string, admin: ItAdminResponseModel) {
        super(status, code, message);
        this.admin = admin;
    }
}
