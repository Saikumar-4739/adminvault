import { Injectable } from '@nestjs/common';
import { DataSource, In, Not } from 'typeorm';
import { AssetInfoEntity } from '../../asset-info/entities/asset-info.entity';
import { EmployeesEntity } from '../../employees/entities/employees.entity';
import { TicketsEntity } from '../../tickets/entities/tickets.entity';
import { CompanyLicenseEntity } from '../../licenses/entities/company-license.entity';
import { AssetStatusEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';
import { AuthUsersEntity } from '../../auth-users/entities/auth-users.entity';

@Injectable()
export class DashboardRepository {
    constructor(private readonly dataSource: DataSource) { }

    async getAssetStats(companyId: number) {
        const repo = this.dataSource.getRepository(AssetInfoEntity);
        const total = await repo.count({ where: { companyId } });
        const byStatus = await repo.createQueryBuilder('asset')
            .select('asset.asset_status_enum as status, COUNT(asset.id) as count')
            .where('asset.company_id = :companyId', { companyId })
            .groupBy('asset.asset_status_enum')
            .getRawMany();
        return { total, byStatus };
    }

    async getTicketStats(companyId: number) {
        const repo = this.dataSource.getRepository(TicketsEntity);
        const total = await repo.count({ where: { companyId } });
        const byStatus = await repo.createQueryBuilder('ticket')
            .select('ticket.ticket_status as status, COUNT(ticket.id) as count')
            .where('ticket.company_id = :companyId', { companyId })
            .groupBy('ticket.ticket_status')
            .getRawMany();
        const byPriority = await repo.createQueryBuilder('ticket')
            .select('ticket.priority_enum as priority, COUNT(ticket.id) as count')
            .where('ticket.company_id = :companyId', { companyId })
            .groupBy('ticket.priority_enum')
            .getRawMany();
        const recent = await repo.createQueryBuilder('ticket')
            .leftJoinAndMapOne('ticket.raisedByEmployee', EmployeesEntity, 'emp', 'emp.id = ticket.employeeId')
            .where('ticket.company_id = :companyId', { companyId })
            .orderBy('ticket.createdAt', 'DESC')
            .take(5)
            .getMany();
        const openCritical = await repo.count({ where: { companyId, priorityEnum: In([TicketPriorityEnum.HIGH, TicketPriorityEnum.URGENT]), ticketStatus: Not(In([TicketStatusEnum.CLOSED, TicketStatusEnum.RESOLVED])) } });
        return { total, byStatus, byPriority, recent, openCritical };
    }

    async getEmployeeStats(companyId: number) {
        const repo = this.dataSource.getRepository(EmployeesEntity);
        const total = await repo.count({ where: { companyId } });
        const byDept = await repo.createQueryBuilder('emp')
            .leftJoin('departments', 'dept', 'dept.id = emp.department_id')
            .select('COALESCE(dept.name, \'Unassigned\') as department, COUNT(emp.id) as count')
            .where('emp.company_id = :companyId', { companyId })
            .groupBy('COALESCE(dept.name, \'Unassigned\')')
            .getRawMany();

        return { total, byDept };
    }

    async getLicenseStats(companyId: number) {
        const query = this.dataSource.getRepository(CompanyLicenseEntity)
            .createQueryBuilder('license')
            .leftJoin('applications', 'app', 'app.id = license.application_id')
            .leftJoin('employees', 'emp', 'emp.id = license.assigned_employee_id')
            .select([
                'license.id as id',
                'license.application_id as applicationId',
                'COALESCE(app.name, \'Unknown Application\') as applicationName',
                'license.expiryDate as expiryDate',
                'COALESCE(CONCAT(emp.first_name, \' \', emp.last_name), \'Unassigned\') as assignedTo',
                'license.assigned_employee_id as assignedEmployeeId'
            ])
            .where('license.company_id = :companyId', { companyId })
            .andWhere('license.expiryDate > :today', { today: new Date() })
            .orderBy('license.expiryDate', 'ASC')
            .limit(5);

        const expiring = await query.getRawMany();
        const total = await this.dataSource.getRepository(CompanyLicenseEntity).count({ where: { companyId } });
        return { total, expiring };
    }

    async getSecurityStats(companyId: number) {
        const userRepo = this.dataSource.getRepository(AuthUsersEntity);
        const assetRepo = this.dataSource.getRepository(AssetInfoEntity);
        const ticketRepo = this.dataSource.getRepository(TicketsEntity);

        // Identity score based on active users
        const totalUsers = await userRepo.count({ where: { companyId } });
        const activeUsers = await userRepo.count({ where: { companyId, status: true } });
        const identityScore = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 100;

        const totalAssets = await assetRepo.count({ where: { companyId } });
        const assignedAssets = await assetRepo.count({ where: { companyId, assetStatusEnum: In([AssetStatusEnum.IN_USE]) } });
        const deviceScore = totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 100;

        const totalTickets = await ticketRepo.count({ where: { companyId } });
        const resolvedTickets = await ticketRepo.count({ where: { companyId, ticketStatus: In([TicketStatusEnum.CLOSED, TicketStatusEnum.RESOLVED]) } });
        const complianceScore = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 100;

        return { identity: Math.round(identityScore), devices: Math.round(deviceScore), compliance: Math.round(complianceScore) };
    }
}
