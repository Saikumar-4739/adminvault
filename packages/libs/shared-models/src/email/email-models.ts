import { GlobalResponse } from '@adminvault/backend-utils';
import { EmailTypeEnum, DepartmentEnum } from '../enums';

export class CreateEmailInfoModel {
    companyId: number;
    emailType: EmailTypeEnum;
    department: DepartmentEnum;
    email: string;
    employeeId?: number;

    constructor(
        companyId: number,
        emailType: EmailTypeEnum,
        department: DepartmentEnum,
        email: string,
        employeeId?: number
    ) {
        this.companyId = companyId;
        this.emailType = emailType;
        this.department = department;
        this.email = email;
        this.employeeId = employeeId;
    }
}

export class UpdateEmailInfoModel extends CreateEmailInfoModel {
    id: number;

    constructor(
        id: number,
        companyId: number,
        emailType: EmailTypeEnum,
        department: DepartmentEnum,
        email: string,
        employeeId?: number
    ) {
        super(companyId, emailType, department, email, employeeId);
        this.id = id;
    }
}

export class DeleteEmailInfoModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class GetEmailInfoModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

export class EmailInfoResponseModel {
    id: number;
    companyId: number;
    emailType: EmailTypeEnum;
    department: DepartmentEnum;
    email: string;
    employeeId?: number;

    constructor(
        id: number,
        companyId: number,
        emailType: EmailTypeEnum,
        department: DepartmentEnum,
        email: string,
        employeeId?: number
    ) {
        this.id = id;
        this.companyId = companyId;
        this.emailType = emailType;
        this.department = department;
        this.email = email;
        this.employeeId = employeeId;
    }
}

export class GetAllEmailInfoModel extends GlobalResponse {
    emailInfo: EmailInfoResponseModel[];

    constructor(status: boolean, code: number, message: string, emailInfo: EmailInfoResponseModel[]) {
        super(status, code, message);
        this.emailInfo = emailInfo;
    }
}

export class GetEmailInfoByIdModel extends GlobalResponse {
    emailInfo: EmailInfoResponseModel;

    constructor(status: boolean, code: number, message: string, emailInfo: EmailInfoResponseModel) {
        super(status, code, message);
        this.emailInfo = emailInfo;
    }
}
