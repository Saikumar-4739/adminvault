import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import { TicketsEntity } from '../../entities/tickets.entity';

@Injectable()
export class ReportsService {
    constructor(private readonly dataSource: DataSource) { }

    async getAssetReports(format: string = 'summary') {
        // Implementation for Asset Reports (Example aggregation)
        const assetRepo = this.dataSource.getRepository(AssetInfoEntity);

        if (format === 'detailed') {
            const allAssets = await assetRepo.find({
                relations: ['assignedToEmployee'] // Fetch relations if needed
            });
            return allAssets;
        }

        const totalAssets = await assetRepo.count();
        const assetsByStatus = await assetRepo.createQueryBuilder('asset')
            .select('asset.assetStatusEnum, COUNT(asset.id) as count')
            .groupBy('asset.assetStatusEnum')
            .getRawMany();

        return {
            totalAssets,
            assetsByStatus
        };
    }

    async getEmployeeReports(format: string = 'summary') {
        const empRepo = this.dataSource.getRepository(EmployeesEntity);

        if (format === 'detailed') {
            return await empRepo.find({
                relations: ['department', 'designation']
            });
        }

        const totalEmployees = await empRepo.count();
        // Add more specific report logic here
        return { totalEmployees };
    }

    async getTicketReports(format: string = 'summary') {
        const ticketRepo = this.dataSource.getRepository(TicketsEntity);

        if (format === 'detailed') {
            return await ticketRepo.find({
                relations: ['raisedByEmployee', 'assignedToItAdmin']
            });
        }

        const totalTickets = await ticketRepo.count();
        const ticketsByStatus = await ticketRepo.createQueryBuilder('ticket')
            .select('ticket.ticketStatus, COUNT(ticket.id) as count')
            .groupBy('ticket.ticketStatus')
            .getRawMany();

        return {
            totalTickets,
            ticketsByStatus
        };
    }

    async generateReport(type: string, filters: any) {
        const format = filters.format || 'summary';
        // Switch based on report type requested from frontend
        switch (type) {
            case 'Asset Inventory Report':
                return this.getAssetReports(format);
            case 'Employee Directory':
                return this.getEmployeeReports(format);
            case 'Ticket Summary Report':
                return this.getTicketReports(format);
            default:
                return { message: 'Report type not implemented yet' };
        }
    }
}
