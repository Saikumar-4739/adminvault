import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import { TicketsEntity } from '../../entities/tickets.entity';
import { CompanyLicenseEntity } from '../../entities/company-license.entity';
import { AssetStatusEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';

@Injectable()
export class DashboardService {
    constructor(private readonly dataSource: DataSource) { }

    async getDashboardStats() {
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
            expiringLicenses
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
                take: 5,
                relations: ['raisedByEmployee']
            }),

            // Employees
            empRepo.count(),
            empRepo.createQueryBuilder('emp')
                .select('emp.department as department, COUNT(emp.id) as count')
                .groupBy('emp.department')
                .getRawMany(),

            // Licenses
            licenseRepo.count(),
            licenseRepo.count({
                // Simple check for now, ideally date comparison
                where: {}
            })
        ]);

        return {
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
                // expiringSoon: expiringLicenses // Placeholder logic
            }
        };
    }
}
