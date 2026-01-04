import { GlobalResponse } from '../common/global-response';

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
        expiringSoon: {
            id: number;
            applicationName: string;
            expiryDate: Date | string; // Allow string for serialization
            assignedTo: string;
        }[];
    };
    systemHealth: {
        assetUtilization: number;
        ticketResolutionRate: number;
        openCriticalTickets: number;
    };
}

export class DashboardStatsResponseModel extends GlobalResponse {
    override data: DashboardStats;

    constructor(status: boolean, code: number, message: string, data: DashboardStats) {
        super(status, code, message);
        this.data = data;
    }
}
