import { Injectable } from '@nestjs/common';
import { DataSource, In, MoreThan, Not } from 'typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import { TicketsEntity } from '../../entities/tickets.entity';
import { CompanyLicenseEntity } from '../../entities/company-license.entity';
import { AssetStatusEnum, TicketStatusEnum, TicketPriorityEnum, DashboardStatsResponseModel, DashboardStats } from '@adminvault/shared-models';

@Injectable()
export class DashboardService {
    constructor(private readonly dataSource: DataSource) { }

    async getDashboardStats(): Promise<DashboardStatsResponseModel> {
        const assetRepo = this.dataSource.getRepository(AssetInfoEntity);
        const ticketRepo = this.dataSource.getRepository(TicketsEntity);
        const empRepo = this.dataSource.getRepository(EmployeesEntity);
        const licenseRepo = this.dataSource.getRepository(CompanyLicenseEntity);

        const [
            totalAssets,
            assetsByStatus,
            totalTickets,
            ticketsByStatus,
            ticketsByPriority,
            recentTickets,
            totalEmployees,
            employeesByDept,
            totalLicenses,
            expiringLicenses,
            openCriticalTickets
        ] = await Promise.all([
            // Assets
            assetRepo.count(),
            assetRepo.createQueryBuilder('asset')
                .select('asset.assetStatusEnum as status, COUNT(asset.id) as count')
                .groupBy('asset.assetStatusEnum')
                .getRawMany(),

            // Tickets
            ticketRepo.count(),
            ticketRepo.createQueryBuilder('ticket')
                .select('ticket.ticketStatus as status, COUNT(ticket.id) as count')
                .groupBy('ticket.ticketStatus')
                .getRawMany(),
            ticketRepo.createQueryBuilder('ticket')
                .select('ticket.priorityEnum as priority, COUNT(ticket.id) as count')
                .groupBy('ticket.priorityEnum')
                .getRawMany(),
            ticketRepo.find({
                order: { createdAt: 'DESC' },
                take: 5
            }),

            // Employees
            empRepo.count(),
            empRepo.createQueryBuilder('emp')
                .select('emp.departmentId as departmentId, COUNT(emp.id) as count')
                .groupBy('emp.departmentId')
                .getRawMany(),

            // Licenses
            licenseRepo.count(),
            licenseRepo.find({
                where: {
                    expiryDate: MoreThan(new Date())
                },
                order: {
                    expiryDate: 'ASC'
                },
                take: 5
            }),

            // Open Critical Tickets
            ticketRepo.count({
                where: {
                    priorityEnum: In([TicketPriorityEnum.HIGH, TicketPriorityEnum.URGENT]), // Updated to URGENT
                    ticketStatus: Not(In([TicketStatusEnum.CLOSED, TicketStatusEnum.RESOLVED]))
                }
            })
        ]);

        // Calculate System Health Metrics
        const inUseCount = assetsByStatus.find((s: any) => s.status === AssetStatusEnum.IN_USE)?.count || 0;
        const assetUtilization = totalAssets > 0 ? (Number(inUseCount) / totalAssets) * 100 : 0;

        const closedResolvedCount = ticketsByStatus
            .filter((s: any) => s.status === TicketStatusEnum.CLOSED || s.status === TicketStatusEnum.RESOLVED)
            .reduce((sum: number, item: any) => sum + Number(item.count), 0);
        const ticketResolutionRate = totalTickets > 0 ? (closedResolvedCount / totalTickets) * 100 : 0;

        const stats: DashboardStats = {
            assets: {
                total: totalAssets,
                byStatus: assetsByStatus
            },
            tickets: {
                total: totalTickets,
                byStatus: ticketsByStatus,
                byPriority: ticketsByPriority,
                recent: recentTickets
            },
            employees: {
                total: totalEmployees,
                byDepartment: employeesByDept
            },
            licenses: {
                total: totalLicenses,
                expiringSoon: expiringLicenses.map(l => ({
                    id: l.id,
                    applicationName: `App ID: ${l.applicationId}`, // Placeholder until we fetch actual names
                    expiryDate: l.expiryDate || new Date(),
                    assignedTo: l.assignedEmployeeId ? `Emp ID: ${l.assignedEmployeeId}` : 'Unassigned'
                }))
            },
            systemHealth: {
                assetUtilization: Math.round(assetUtilization),
                ticketResolutionRate: Math.round(ticketResolutionRate),
                openCriticalTickets: openCriticalTickets
            }
        };

        return new DashboardStatsResponseModel(true, 200, 'Dashboard stats retrieved successfully', stats);
    }
}
