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
    employeeName?: string;

    constructor(
        id: number,
        companyId: number,
        emailType: EmailTypeEnum,
        department: string,
        email: string,
        employeeId?: number,
        employeeName?: string
    ) {
        this.id = id;
        this.companyId = companyId;
        this.emailType = emailType;
        this.department = department;
        this.email = email;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
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

export class SendTicketCreatedEmailModel {
    ticket: any;
    recipientEmail: string;
    roleName: string;

    constructor(ticket: any, recipientEmail: string, roleName: string) {
        this.ticket = ticket;
        this.recipientEmail = recipientEmail;
        this.roleName = roleName;
    }
}

export class SendPasswordResetEmailModel {
    email: string;
    token: string;

    constructor(email: string, token: string) {
        this.email = email;
        this.token = token;
    }
}

export class SendAssetApprovalEmailModel {
    approverEmail: string;
    companyId: number;
    requesterName: string;
    message?: string;
    assetStats?: {
        total: number;
        available: number;
        inUse: number;
        maintenance: number;
        retired: number;
    };

    constructor(
        approverEmail: string,
        companyId: number,
        requesterName: string,
        message?: string,
        assetStats?: {
            total: number;
            available: number;
            inUse: number;
            maintenance: number;
            retired: number;
        }
    ) {
        this.approverEmail = approverEmail;
        this.companyId = companyId;
        this.requesterName = requesterName;
        this.assetStats = assetStats;
    }
}

export class SendAssetAssignedEmailModel {
    recipientEmail: string;
    recipientName: string;
    assetName: string; // e.g., "MacBook Pro (SN: 12345)"
    assignedBy: string;
    assignedDate: Date;
    isReassignment: boolean;
    remarks?: string;

    constructor(
        recipientEmail: string,
        recipientName: string,
        assetName: string,
        assignedBy: string,
        assignedDate: Date,
        isReassignment: boolean = false,
        remarks?: string
    ) {
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName;
        this.assetName = assetName;
        this.assignedBy = assignedBy;
        this.assignedDate = assignedDate;
        this.isReassignment = isReassignment;
        this.remarks = remarks;
    }
}

export class SendTicketStatusUpdateEmailModel {
    ticket: any;
    recipientEmail: string;
    roleName: string;
    oldStatus: string;
    newStatus: string;

    constructor(ticket: any, recipientEmail: string, roleName: string, oldStatus: string, newStatus: string) {
        this.ticket = ticket;
        this.recipientEmail = recipientEmail;
        this.roleName = roleName;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}

