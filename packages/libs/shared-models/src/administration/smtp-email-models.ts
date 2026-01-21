import { GlobalResponse } from '../common/global-response';

// SMTP Email Configuration Models (for administration/email-info)

export class CreateSMTPEmailInfoModel {
    emailType!: string;
    smtpHost!: string;
    smtpPort!: number;
    smtpUser!: string;
    smtpPassword!: string;
    fromEmail!: string;
    fromName?: string;
    isDefault?: boolean;
    companyId!: number;
}

export class UpdateSMTPEmailInfoModel {
    id!: number;
    emailType?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromEmail?: string;
    fromName?: string;
    isDefault?: boolean;
}

export class GetSMTPEmailInfoModel {
    id!: number;
}

export class DeleteSMTPEmailInfoModel {
    id!: number;
}

export class SMTPEmailInfoResponseModel {
    id: number;
    emailType: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    fromEmail: string;
    fromName: string;
    isDefault: boolean;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: number, emailType: string, smtpHost: string, smtpPort: number, smtpUser: string, fromEmail: string, fromName: string, isDefault: boolean, companyId: number, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.emailType = emailType;
        this.smtpHost = smtpHost;
        this.smtpPort = smtpPort;
        this.smtpUser = smtpUser;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.isDefault = isDefault;
        this.companyId = companyId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class GetAllSMTPEmailInfoModel extends GlobalResponse<SMTPEmailInfoResponseModel[]> {
    constructor(status: boolean, code: number, message: string, data: SMTPEmailInfoResponseModel[]) {
        super(status, code, message, data);
    }
}

export class GetSMTPEmailInfoByIdModel extends GlobalResponse<SMTPEmailInfoResponseModel> {
    constructor(status: boolean, code: number, message: string, data: SMTPEmailInfoResponseModel) {
        super(status, code, message, data);
    }
}

export class SMTPEmailStatsResponseModel extends GlobalResponse {
    totalEmails!: number;
    successfulEmails!: number;
    failedEmails!: number;
}
