import { GlobalResponse } from '../common/global-response';

export class DashboardStats {
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
            expiryDate: Date | string;
            assignedTo: string;
        }[];
    };
    procurement: {
        totalPOs: number;
        totalSpend: number;
        activeVendors: number;
        recent: any[];
    };

    constructor(
        assets: { total: number; byStatus: { status: string; count: string }[] },
        tickets: { total: number; byStatus: { status: string; count: string }[]; byPriority: { priority: string; count: string }[]; recent: any[] },
        employees: { total: number; byDepartment: { department: string; count: string }[] },
        licenses: { total: number; expiringSoon: { id: number; applicationName: string; expiryDate: Date | string; assignedTo: string }[] },
        procurement: { totalPOs: number; totalSpend: number; activeVendors: number; recent: any[] }
    ) {
        this.assets = assets;
        this.tickets = tickets;
        this.employees = employees;
        this.licenses = licenses;
        this.procurement = procurement;
    }
}

export class DashboardStatsResponseModel extends GlobalResponse {
    override data: DashboardStats;

    constructor(status: boolean, code: number, message: string, data: DashboardStats) {
        super(status, code, message);
        this.data = data;
    }
}
