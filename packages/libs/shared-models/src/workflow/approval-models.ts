import { GlobalResponse } from '../common/global-response';

// ============================================
// ENUMS
// ============================================

export enum ApprovalStatusEnum {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export enum ApprovalTypeEnum {
    TICKET = 'TICKET',
    ASSET_ALLOCATION = 'ASSET_ALLOCATION',
    EXPENSE = 'EXPENSE',
    LICENSE_ALLOCATION = 'LICENSE_ALLOCATION',
    PURCHASE_ORDER = 'PURCHASE_ORDER'
}

// ============================================
// REQUEST MODELS - CREATE
// ============================================

export class CreateApprovalRequestModel {
    referenceType: ApprovalTypeEnum;
    referenceId: number;
    requesterId: number;
    companyId: number;
    description?: string;
    managerEmail?: string;
    requesterName?: string;
    /** employees table ID of the user being assigned (used to resolve their manager) */
    assignedToEmployeeId?: number;

    constructor(
        referenceType: ApprovalTypeEnum,
        referenceId: number,
        requesterId: number,
        companyId: number,
        description?: string,
        managerEmail?: string,
        requesterName?: string,
        assignedToEmployeeId?: number
    ) {
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.requesterId = requesterId;
        this.companyId = companyId;
        this.description = description;
        this.managerEmail = managerEmail;
        this.requesterName = requesterName;
        this.assignedToEmployeeId = assignedToEmployeeId;
    }
}

// ============================================
// REQUEST MODELS - UPDATE
// ============================================

export class ApprovalActionModel {
    requestId: number;
    actionByUserId: number;
    remarks?: string;

    constructor(
        requestId: number,
        actionByUserId: number,
        remarks?: string
    ) {
        this.requestId = requestId;
        this.actionByUserId = actionByUserId;
        this.remarks = remarks;
    }
}

// ============================================
// REQUEST MODELS - GET
// ============================================

export class GetPendingApprovalsRequestModel {
    companyId: number;

    constructor(companyId: number) {
        this.companyId = companyId;
    }
}

// ============================================
// DATA MODELS
// ============================================

export class ApprovalRequestResponseModel {
    id: number;
    referenceType: ApprovalTypeEnum;
    referenceId: number;
    status: ApprovalStatusEnum;
    requesterName: string;
    requestedAt: Date;
    description?: string;

    constructor(
        id: number,
        referenceType: ApprovalTypeEnum,
        referenceId: number,
        status: ApprovalStatusEnum,
        requesterName: string,
        requestedAt: Date,
        description?: string
    ) {
        this.id = id;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.status = status;
        this.requesterName = requesterName;
        this.requestedAt = requestedAt;
        this.description = description;
    }
}

// ============================================
// RESPONSE MODELS
// ============================================

export class InitiateApprovalResponseModel extends GlobalResponse {
    approvalRequest?: ApprovalRequestResponseModel;

    constructor(status: boolean, code: number, message: string, approvalRequest?: ApprovalRequestResponseModel) {
        super(status, code, message);
        this.approvalRequest = approvalRequest;
    }
}

export class ApproveRequestResponseModel extends GlobalResponse {
    constructor(status: boolean, code: number, message: string) {
        super(status, code, message);
    }
}

export class RejectRequestResponseModel extends GlobalResponse {
    constructor(status: boolean, code: number, message: string) {
        super(status, code, message);
    }
}

export class GetPendingApprovalsResponseModel extends GlobalResponse {
    approvals: ApprovalRequestResponseModel[];

    constructor(status: boolean, code: number, message: string, approvals: ApprovalRequestResponseModel[]) {
        super(status, code, message);
        this.approvals = approvals;
    }
}
