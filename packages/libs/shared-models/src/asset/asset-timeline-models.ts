import { GlobalResponse } from '../common/global-response';

export enum AssetTimelineEventType {
    CREATED = 'CREATED',
    ASSIGNED = 'ASSIGNED',
    RETURNED = 'RETURNED',
    MAINTENANCE = 'MAINTENANCE',
    RETIRED = 'RETIRED',
    UNKNOWN = 'UNKNOWN'
}

export interface AssetTimelineEvent {
    id: string; // Unique ID for keying (can be composite)
    date: Date;
    type: AssetTimelineEventType;
    title: string;
    description?: string;
    employeeName?: string;
    employeeId?: number;
    performedBy?: string; // Admin who performed the action if tracking available
    metadata?: any; // For flexible extra data like return condition
}

export class AssetTimelineResponseModel extends GlobalResponse {
    override events: AssetTimelineEvent[];

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
