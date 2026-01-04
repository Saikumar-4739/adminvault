import { Injectable } from '@nestjs/common';
import { DataSource, In, MoreThan, Not } from 'typeorm';
import { AssetInfoEntity } from '../../asset-info/entities/asset-info.entity';
import { EmployeesEntity } from '../../employees/entities/employees.entity';
import { TicketsEntity } from '../../tickets/entities/tickets.entity';
import { CompanyLicenseEntity } from '../../licenses/entities/company-license.entity';
import { AssetStatusEnum, TicketStatusEnum, TicketPriorityEnum } from '@adminvault/shared-models';

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
        const repo = this.dataSource.getRepository(CompanyLicenseEntity);
        const total = await repo.count();
        const expiring = await repo.find({ where: { expiryDate: MoreThan(new Date()) }, order: { expiryDate: 'ASC' }, take: 5 });
        return { total, expiring };
    }
}
