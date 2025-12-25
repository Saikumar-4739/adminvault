import { GlobalResponse } from '@adminvault/backend-utils';

export interface DashboardStats {
    assets: {
        total: number;
        byStatus: { status: string; count: string }[];
    };
    tickets: {
        total: number;
        byStatus: { status: string; count: string }[];
        byPriority: { priority: string; count: string }[];
        recent: any[];
    };
    employees: {
        total: number;
        byDepartment: { department: string; count: string }[];
    };
    licenses: {
        total: number;
    };
}

export class DashboardStatsResponseModel extends GlobalResponse {
    data: DashboardStats;

    constructor(status: boolean, code: number, message: string, data: DashboardStats) {
        super(status, code, message);
        this.data = data;
    }
}
