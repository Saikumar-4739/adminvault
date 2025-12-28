import { GlobalResponse } from '../common/global-response';
import { AssetStatusEnum } from '../enums';

// ============================================
// STORE ASSETS TAB MODELS
// ============================================

export interface StoreAssetModel {
    id: number;
    deviceName: string;
    configuration?: string;
    serialNumber: string;
    expressCode?: string;
    boxNo?: string;
    pastUserName?: string;
    presentUserName?: string;
    assetStatusEnum: AssetStatusEnum;
    brandName?: string;
    model?: string;
    warrantyExpiry?: Date;
}

export class GetStoreAssetsRequestModel {
    companyId: number;
    constructor(companyId: number) {
        this.companyId = companyId;
    }
}

export class GetStoreAssetsResponseModel extends GlobalResponse {
    assets: StoreAssetModel[];
    constructor(status: boolean, code: number, message: string, assets: StoreAssetModel[]) {
        super(status, code, message);
        this.assets = assets;
    }
}

// ============================================
// RETURN ASSETS TAB MODELS
// ============================================

export interface ReturnAssetModel {
    id: number;
    employeeName: string;
    employeeRole?: string;
    laptopAllocationStatus?: string;
    desktopAllocationStatus?: string;
    configuration?: string;
    allocationDate?: Date;
    returnDate: Date;
    returnReason?: string;
    assetCondition?: string;
    assetId: number;
    serialNumber?: string;
}

export class GetReturnAssetsRequestModel {
    companyId: number;
    startDate?: string;
    endDate?: string;
    employeeId?: number;

    constructor(companyId: number, startDate?: string, endDate?: string, employeeId?: number) {
        this.companyId = companyId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.employeeId = employeeId;
    }
}

export class GetReturnAssetsResponseModel extends GlobalResponse {
    returns: ReturnAssetModel[];
    constructor(status: boolean, code: number, message: string, returns: ReturnAssetModel[]) {
        super(status, code, message);
        this.returns = returns;
    }
}

export class ProcessReturnRequestModel {
    assetId: number;
    employeeId: number;
    returnDate: string;
    returnReason?: string;
    assetCondition?: string;
    remarks?: string;
    userId: number;
    companyId: number;

    constructor(
        assetId: number,
        employeeId: number,
        returnDate: string,
        userId: number,
        companyId: number,
        returnReason?: string,
        assetCondition?: string,
        remarks?: string
    ) {
        this.assetId = assetId;
        this.employeeId = employeeId;
        this.returnDate = returnDate;
        this.returnReason = returnReason;
        this.assetCondition = assetCondition;
        this.remarks = remarks;
        this.userId = userId;
        this.companyId = companyId;
    }
}

export class ProcessReturnResponseModel extends GlobalResponse {
    returnRecord: ReturnAssetModel;
    constructor(status: boolean, code: number, message: string, returnRecord: ReturnAssetModel) {
        super(status, code, message);
        this.returnRecord = returnRecord;
    }
}

// ============================================
// NEXT ASSIGN ASSETS TAB MODELS
// ============================================

export enum NextAssignmentStatus {
    PENDING = 'Pending',
    ASSIGNED = 'Assigned',
    CANCELLED = 'Cancelled'
}

export enum AssignmentPriority {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High'
}

export interface NextAssignmentModel {
    id: number;
    employeeName: string;
    employeeRole?: string;
    laptopAllocationStatus?: NextAssignmentStatus;
    desktopAllocationStatus?: NextAssignmentStatus;
    assetType: string;
    requestDate: Date;
    expectedDate?: Date;
    assignedAssetId?: number;
    assignedAssetName?: string;
    status: NextAssignmentStatus;
    priority?: AssignmentPriority;
    remarks?: string;
}

export class GetNextAssignmentsRequestModel {
    companyId: number;
    constructor(companyId: number) {
        this.companyId = companyId;
    }
}

export class GetNextAssignmentsResponseModel extends GlobalResponse {
    assignments: NextAssignmentModel[];
    constructor(status: boolean, code: number, message: string, assignments: NextAssignmentModel[]) {
        super(status, code, message);
        this.assignments = assignments;
    }
}

export class CreateNextAssignmentRequestModel {
    employeeId: number;
    assetType: string;
    requestDate: string;
    expectedDate?: string;
    priority?: AssignmentPriority;
    remarks?: string;
    userId: number;
    companyId: number;

    constructor(
        employeeId: number,
        assetType: string,
        requestDate: string,
        userId: number,
        companyId: number,
        expectedDate?: string,
        priority?: AssignmentPriority,
        remarks?: string
    ) {
        this.employeeId = employeeId;
        this.assetType = assetType;
        this.requestDate = requestDate;
        this.expectedDate = expectedDate;
        this.priority = priority;
        this.remarks = remarks;
        this.userId = userId;
        this.companyId = companyId;
    }
}

export class CreateNextAssignmentResponseModel extends GlobalResponse {
    assignment: NextAssignmentModel;
    constructor(status: boolean, code: number, message: string, assignment: NextAssignmentModel) {
        super(status, code, message);
        this.assignment = assignment;
    }
}

export class AssignFromQueueRequestModel {
    queueId: number;
    assetId: number;
    userId: number;

    constructor(queueId: number, assetId: number, userId: number) {
        this.queueId = queueId;
        this.assetId = assetId;
        this.userId = userId;
    }
}

export class AssignFromQueueResponseModel extends GlobalResponse {
    assignment: NextAssignmentModel;
    constructor(status: boolean, code: number, message: string, assignment: NextAssignmentModel) {
        super(status, code, message);
        this.assignment = assignment;
    }
}
