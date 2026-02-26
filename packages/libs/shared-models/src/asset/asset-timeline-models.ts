import { GlobalResponse } from '../common/global-response';

export enum AssetTimelineEventType {
    CREATED = 'CREATED',
    ASSIGNED = 'ASSIGNED',
    RETURNED = 'RETURNED',
    MAINTENANCE = 'MAINTENANCE',
    RETIRED = 'RETIRED',
    UNKNOWN = 'UNKNOWN'
}

export class AssetTimelineEvent {
    id: string;
    date: Date;
    type: AssetTimelineEventType;
    title: string;
    description?: string;
    employeeName?: string;
    employeeId?: number;
    performedBy?: string;
    metadata?: any;
    constructor(
        id: string,
        date: Date,
        type: AssetTimelineEventType,
        title: string,
        description: string,
        employeeName: string,
        employeeId: number,
        performedBy: string,
        metadata: any
    ) {
        this.id = id;
        this.date = date;
        this.type = type;
        this.title = title;
        this.description = description;
        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.performedBy = performedBy;
        this.metadata = metadata;
    }
}

export class AssetTimelineResponseModel extends GlobalResponse {
    events: AssetTimelineEvent[];

    constructor(
        status: boolean,
        code: number,
        message: string,
        events: AssetTimelineEvent[] = []
    ) {
        super(status, code, message);
        this.events = events;
    }
}

export class AssetTimelineRequestModel {
    id: number;
    companyId: number;

    constructor(id: number, companyId: number) {
        this.id = id;
        this.companyId = companyId;
    }
}
