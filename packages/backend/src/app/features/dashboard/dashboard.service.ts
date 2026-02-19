import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './repositories/dashboard.repository';
import { AssetStatusEnum, TicketStatusEnum, DashboardStatsResponseModel, DashboardStats, IdRequestModel } from '@adminvault/shared-models';

@Injectable()
export class DashboardService {
    constructor(private readonly repository: DashboardRepository) { }

    /**
     * Get consolidated statistics for the dashboard
     * Aggregates data from assets, tickets, employees, and licenses
     * Filtered by company ID
     */
    async getDashboardStats(reqModel: IdRequestModel): Promise<DashboardStatsResponseModel> {
        try {
            const companyId = reqModel.id;
            const [assetStats, ticketStats, employeeStats, licenseStats, securityStats] = await Promise.all([
                this.repository.getAssetStats(companyId),
                this.repository.getTicketStats(companyId),
                this.repository.getEmployeeStats(companyId),
                this.repository.getLicenseStats(companyId),
                this.repository.getSecurityStats(companyId)
            ]);
            const inUseCount = assetStats.byStatus.find((s: any) => s.status === AssetStatusEnum.IN_USE)?.count || 0;
            const assetUtilization = assetStats.total > 0 ? (Number(inUseCount) / assetStats.total) * 100 : 0;
            const closedResolvedCount = ticketStats.byStatus.filter((s: any) => s.status === TicketStatusEnum.CLOSED || s.status === TicketStatusEnum.RESOLVED).reduce((sum: number, item: any) => sum + Number(item.count), 0);
            const ticketResolutionRate = ticketStats.total > 0 ? (closedResolvedCount / ticketStats.total) * 100 : 0;

            const securityScore = Math.round((securityStats.identity + securityStats.devices + securityStats.compliance) / 3);

            const stats: DashboardStats = {
                assets: { total: assetStats.total, byStatus: assetStats.byStatus },
                tickets: { total: ticketStats.total, byStatus: ticketStats.byStatus, byPriority: ticketStats.byPriority, recent: ticketStats.recent },
                employees: { total: employeeStats.total, byDepartment: employeeStats.byDept },
                licenses: {
                    total: licenseStats.total,
                    expiringSoon: licenseStats.expiring.map(l => ({
                        id: l.id,
                        applicationName: l.applicationName,
                        expiryDate: l.expiryDate,
                        assignedTo: l.assignedTo
                    }))
                },
                systemHealth: { assetUtilization: Math.round(assetUtilization), ticketResolutionRate: Math.round(ticketResolutionRate), openCriticalTickets: ticketStats.openCritical },
                security: {
                    score: securityScore,
                    metrics: securityStats
                }
            };
            return new DashboardStatsResponseModel(true, 200, 'Dashboard stats retrieved successfully', stats);
        } catch (error) {
            throw error;
        }
    }
}
