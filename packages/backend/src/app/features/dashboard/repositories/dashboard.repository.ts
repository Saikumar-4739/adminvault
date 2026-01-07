import { Injectable } from '@nestjs/common';
import { DataSource, In, MoreThan, Not } from 'typeorm';
import { AssetInfoEntity } from '../../asset-info/entities/asset-info.entity';
import { EmployeesEntity } from '../../employees/entities/employees.entity';
import { TicketsEntity } from '../../tickets/entities/tickets.entity';
import { CompanyLicenseEntity } from '../../licenses/entities/company-license.entity';
import { AssetStatusEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';

import { AuthUsersEntity } from '../../auth-users/entities/auth-users.entity';
import { MFASettingsEntity } from '../../administration/entities/mfa-settings.entity';

@Injectable()
export class DashboardRepository {
    constructor(private readonly dataSource: DataSource) { }

    async getAssetStats() {
        const repo = this.dataSource.getRepository(AssetInfoEntity);
        const total = await repo.count();
        const byStatus = await repo.createQueryBuilder('asset')
            .select('asset.asset_status_enum as status, COUNT(asset.id) as count')
            .groupBy('asset.asset_status_enum')
            .getRawMany();
        return { total, byStatus };
    }

    async getTicketStats() {
        const repo = this.dataSource.getRepository(TicketsEntity);
        const total = await repo.count();
        const byStatus = await repo.createQueryBuilder('ticket')
            .select('ticket.ticket_status as status, COUNT(ticket.id) as count')
            .groupBy('ticket.ticket_status')
            .getRawMany();
        const byPriority = await repo.createQueryBuilder('ticket')
            .select('ticket.priority_enum as priority, COUNT(ticket.id) as count')
            .groupBy('ticket.priority_enum')
            .getRawMany();
        const recent = await repo.find({ order: { createdAt: 'DESC' }, take: 5 });
        const openCritical = await repo.count({ where: { priorityEnum: In([TicketPriorityEnum.HIGH, TicketPriorityEnum.URGENT]), ticketStatus: Not(In([TicketStatusEnum.CLOSED, TicketStatusEnum.RESOLVED])) } });
        return { total, byStatus, byPriority, recent, openCritical };
    }

    async getEmployeeStats() {
        const repo = this.dataSource.getRepository(EmployeesEntity);
        const total = await repo.count();
        const byDept = await repo.createQueryBuilder('emp')
            .select('emp.department_id as departmentId, COUNT(emp.id) as count')
            .groupBy('emp.department_id')
            .getRawMany();
        return { total, byDept };
    }

    async getLicenseStats() {
        const query = this.dataSource.getRepository(CompanyLicenseEntity)
            .createQueryBuilder('license')
            .leftJoin('applications', 'app', 'app.id = license.application_id')
            .leftJoin('employees', 'emp', 'emp.id = license.assigned_employee_id')
            .select([
                'license.id as id',
                'app.name as applicationName',
                'license.expiryDate as expiryDate',
                'CONCAT(emp.first_name, \' \', emp.last_name) as assignedTo'
            ])
            .where('license.expiryDate > :today', { today: new Date() })
            .orderBy('license.expiryDate', 'ASC')
            .limit(5);

        const expiring = await query.getRawMany();
        const total = await this.dataSource.getRepository(CompanyLicenseEntity).count();
        return { total, expiring };
    }

    async getSecurityStats() {
        const userRepo = this.dataSource.getRepository(AuthUsersEntity);
        const mfaRepo = this.dataSource.getRepository(MFASettingsEntity);
        const assetRepo = this.dataSource.getRepository(AssetInfoEntity);
        const ticketRepo = this.dataSource.getRepository(TicketsEntity);

        const totalUsers = await userRepo.count();
        const enabledMFACount = await mfaRepo.count({ where: { isEnabled: true } });
        const identityScore = totalUsers > 0 ? (enabledMFACount / totalUsers) * 100 : 100;

        const totalAssets = await assetRepo.count();
        const assignedAssets = await assetRepo.count({ where: { assetStatusEnum: In([AssetStatusEnum.IN_USE]) } });
        const deviceScore = totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 100;

        const totalTickets = await ticketRepo.count();
        const resolvedTickets = await ticketRepo.count({ where: { ticketStatus: In([TicketStatusEnum.CLOSED, TicketStatusEnum.RESOLVED]) } });
        const complianceScore = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 100;

        return {
            identity: Math.round(identityScore),
            devices: Math.round(deviceScore),
            compliance: Math.round(complianceScore)
        };
    }
}
