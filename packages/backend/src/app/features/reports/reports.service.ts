import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import { TicketsEntity } from '../../entities/tickets.entity';

@Injectable()
export class ReportsService {
    constructor(private readonly dataSource: DataSource) { }

    async getAssetReports(format: string = 'summary') {
        // Use raw query with manual joins to avoid foreign key constraint issues
        const query = `
            SELECT 
                a.id AS assetId,
                a.serial_number AS serialNumber,
                a.express_code AS expressCode,
                a.model,
                a.configuration,
                a.box_no AS boxNo,
                a.asset_status_enum AS status,
                a.purchase_date AS purchaseDate,
                a.warranty_expiry AS warrantyExpiry,
                a.user_assigned_date AS userAssignedDate,
                a.last_return_date AS lastReturnDate,
                a.created_at AS createdAt,
                a.updated_at AS updatedAt,
                d.device_name AS deviceName,
                b.name AS brandName,
                CONCAT(e1.first_name, ' ', e1.last_name) AS assignedTo,
                e1.email AS assignedEmail,
                CONCAT(e2.first_name, ' ', e2.last_name) AS previousUser
            FROM asset_info a
            LEFT JOIN device_info d ON a.device_id = d.id
            LEFT JOIN device_brands b ON a.brand_id = b.id
            LEFT JOIN employees e1 ON a.assigned_to_employee_id = e1.id
            LEFT JOIN employees e2 ON a.previous_user_employee_id = e2.id
            ORDER BY a.id DESC
        `;

        const rawResults = await this.dataSource.query(query);

        // Format data for Excel/CSV export
        const formattedAssets = rawResults.map((asset: any) => ({
            'Asset ID': asset.assetId,
            'Serial Number': asset.serialNumber,
            'Express Code': asset.expressCode || 'N/A',
            'Device Type': asset.deviceName || 'N/A',
            'Brand': asset.brandName || 'N/A',
            'Model': asset.model || 'N/A',
            'Configuration': asset.configuration || 'N/A',
            'Box Number': asset.boxNo || 'N/A',
            'Status': asset.status,
            'Assigned To': asset.assignedTo || 'Unassigned',
            'Assigned Employee Email': asset.assignedEmail || 'N/A',
            'Previous User': asset.previousUser || 'N/A',
            'Purchase Date': asset.purchaseDate || 'N/A',
            'Warranty Expiry': asset.warrantyExpiry || 'N/A',
            'User Assigned Date': asset.userAssignedDate || 'N/A',
            'Last Return Date': asset.lastReturnDate || 'N/A',
            'Created At': asset.createdAt,
            'Updated At': asset.updatedAt,
        }));

        return formattedAssets;
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
            case 'Asset Allocation Report':
                return this.getAssetReports(format); // Same as inventory for now
            case 'Employee Directory':
                return this.getEmployeeReports(format);
            case 'Ticket Summary Report':
                return this.getTicketReports(format);
            default:
                return { message: 'Report type not implemented yet' };
        }
    }
}
