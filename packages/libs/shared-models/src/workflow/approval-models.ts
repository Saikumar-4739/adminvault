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

export class CreateApprovalRequestModel {
    constructor(
        public referenceType: ApprovalTypeEnum,
        public referenceId: number,
        public requesterId: number,
        public companyId: number,
        public description?: string
    ) { }
}

export class ApprovalActionModel {
    constructor(
        public requestId: number,
        public actionByUserId: number,
        public remarks?: string
    ) { }
}

export class ApprovalRequestResponseModel {
    constructor(
        public id: number,
        public referenceType: ApprovalTypeEnum,
        public referenceId: number,
        public status: ApprovalStatusEnum,
        public requesterName: string,
        public requestedAt: Date,
        public description?: string
    ) { }
}
