import { GlobalResponse } from '../common/global-response';
import { EmailTypeEnum, EmailStatusEnum } from '../enums';

/**
 * Request model for creating a new email account
 */
export class CreateEmailAccountModel {
    employeeId?: number;
    email: string;
    emailType: EmailTypeEnum;
    status?: EmailStatusEnum;

    constructor(
        email: string,
        emailType: EmailTypeEnum,
        employeeId?: number,
        status?: EmailStatusEnum
    ) {
        this.email = email;
        this.emailType = emailType;
        this.employeeId = employeeId;
        this.status = status;
    }
}

/**
 * Request model for deleting an email account
 */
export class DeleteEmailAccountModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

/**
 * Response model for a single email account
 */
export class EmailAccountResponseModel {
    id: number;
    employeeId?: number;
    email: string;
    emailType: EmailTypeEnum;
    status: EmailStatusEnum;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        email: string,
        emailType: EmailTypeEnum,
        status: EmailStatusEnum,
        createdAt: Date,
        updatedAt: Date,
        employeeId?: number
    ) {
        this.id = id;
        this.email = email;
        this.emailType = emailType;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.employeeId = employeeId;
    }
}

/**
 * Response model for getting all email accounts
 */
export class GetAllEmailAccountsModel extends GlobalResponse {
    data: EmailAccountResponseModel[];

    constructor(status: boolean, code: number, message: string, data: EmailAccountResponseModel[]) {
        super(status, code, message);
        this.data = data;
    }
}
