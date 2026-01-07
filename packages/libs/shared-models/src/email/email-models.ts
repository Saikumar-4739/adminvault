import { GlobalResponse } from '../common/global-response';
import { EmailTypeEnum } from '../enums';

export class CreateEmailInfoModel {
    companyId: number;
    emailType: EmailTypeEnum;
    department: string;
    email: string;
    employeeId?: number;

    constructor(
        companyId: number,
        emailType: EmailTypeEnum,
        department: string,
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
        department: string,
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
    department: string;
    email: string;
    employeeId?: number;

    constructor(
        id: number,
        companyId: number,
        emailType: EmailTypeEnum,
        department: string,
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
    override data: EmailInfoResponseModel[];
    constructor(status: boolean, code: number, message: string, data: EmailInfoResponseModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class GetEmailInfoByIdModel extends GlobalResponse {
    override data: EmailInfoResponseModel;
    constructor(status: boolean, code: number, message: string, data: EmailInfoResponseModel) {
        super(status, code, message);
        this.data = data;
    }
}

export class EmailStatsResponseModel extends GlobalResponse {
    override data: {
        byType: any[];
        byStatus: any[];
    };
    constructor(status: boolean, code: number, message: string, data: { byType: any[]; byStatus: any[] }) {
        super(status, code, message);
        this.data = data;
    }
}
