
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import { TicketsEntity } from '../../entities/tickets.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class ReportsService {
    constructor(
        private readonly dataSource: DataSource,
        private auditLogsService: AuditLogsService
    ) { }

    private generateExcelBuffer(data: any[]): Buffer {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return buffer;
    }

    private async generatePdfBuffer(data: any[], reportTitle: string): Promise<Buffer> {
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let page = pdfDoc.addPage([842, 595]); // A4 landscape
        const { width, height } = page.getSize();

        // Title
        page.drawText(reportTitle, {
            x: 50,
            y: height - 50,
            size: 16,
            font: boldFont,
            color: rgb(0.2, 0.2, 0.2),
        });

        // Date
        page.drawText(`Generated: ${new Date().toLocaleString()}`, {
            x: 50,
            y: height - 70,
            size: 10,
            font: timesRomanFont,
            color: rgb(0.4, 0.4, 0.4),
        });

        if (data && data.length > 0) {
            const headers = Object.keys(data[0]);
            const fontSize = 8;
            const lineHeight = 15;
            const startY = height - 100;
            const startX = 50;
            const columnWidth = Math.min(120, (width - 100) / headers.length);

            let currentY = startY;

            // Draw headers
            headers.forEach((header, i) => {
                page.drawText(header.substring(0, 15), {
                    x: startX + (i * columnWidth),
                    y: currentY,
                    size: fontSize,
                    font: boldFont,
                    color: rgb(0.31, 0.27, 0.91), // Indigo color
                });
            });

            currentY -= lineHeight;

            // Draw data rows (limit to first 30 rows to fit on page)
            const rowsToShow = Math.min(data.length, 30);
            for (let rowIdx = 0; rowIdx < rowsToShow; rowIdx++) {
                const row = data[rowIdx];

                if (currentY < 50) {
                    // Add new page if needed
                    page = pdfDoc.addPage([842, 595]);
                    currentY = height - 50;
                }

                headers.forEach((header, colIdx) => {
                    const cellValue = row[header];
                    const text = cellValue !== null && cellValue !== undefined
                        ? String(cellValue).substring(0, 20)
                        : '-';

                    page.drawText(text, {
                        x: startX + (colIdx * columnWidth),
                        y: currentY,
                        size: fontSize,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
                    });
                });

                currentY -= lineHeight;
            }

            // Add footer if data was truncated
            if (data.length > 30) {
                page.drawText(`Showing first 30 of ${data.length} records. Download Excel for complete data.`, {
                    x: 50,
                    y: 30,
                    size: 8,
                    font: timesRomanFont,
                    color: rgb(0.5, 0.5, 0.5),
                });
            }
        }

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }

    async getAssetReports(format: string = 'summary') {
        // Use raw query with manual joins
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
        if (format === 'summary') {
            const empRepo = this.dataSource.getRepository(EmployeesEntity);
            const totalEmployees = await empRepo.count();
            return { totalEmployees };
        }

        const query = `
            SELECT 
                e.id, 
                e.first_name AS firstName, 
                e.last_name AS lastName, 
                e.email, 
                e.ph_number AS phone, 
                e.emp_status AS status,
                e.created_at AS joinDate,
                d.name AS departmentName,
                c.company_name AS companyName
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN company_info c ON e.company_id = c.id
            ORDER BY e.id DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((emp: any) => ({
            'ID': emp.id,
            'Full Name': `${emp.firstName} ${emp.lastName}`,
            'Email': emp.email,
            'Phone': emp.phone || 'N/A',
            'Department': emp.departmentName || 'N/A',
            'Company': emp.companyName || 'N/A',
            'Status': emp.status,
            'Join Date': emp.joinDate
        }));
    }

    async getTicketReports(format: string = 'summary') {
        if (format === 'summary') {
            const ticketRepo = this.dataSource.getRepository(TicketsEntity);
            const totalTickets = await ticketRepo.count();
            const ticketsByStatus = await ticketRepo.createQueryBuilder('ticket')
                .select('ticket.ticketStatus, COUNT(ticket.id) as count')
                .groupBy('ticket.ticketStatus')
                .getRawMany();
            return { totalTickets, ticketsByStatus };
        }

        const query = `
            SELECT 
                t.ticket_code AS ticketCode,
                t.subject,
                t.priority_enum AS priority,
                t.category_enum AS category,
                t.ticket_status AS status,
                t.created_at AS createdAt,
                t.resolved_at AS resolvedAt,
                CONCAT(e1.first_name, ' ', e1.last_name) AS raisedBy,
                CONCAT(e2.first_name, ' ', e2.last_name) AS assignedTo
            FROM tickets t
            LEFT JOIN employees e1 ON t.employee_id = e1.id
            LEFT JOIN employees e2 ON t.assign_admin_id = e2.id
            ORDER BY t.created_at DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((t: any) => ({
            'Ticket Code': t.ticketCode,
            'Subject': t.subject,
            'Priority': t.priority,
            'Category': t.category,
            'Status': t.status,
            'Raised By': t.raisedBy || 'Unknown',
            'Assigned To': t.assignedTo || 'Unassigned',
            'Created At': t.createdAt,
            'Resolved At': t.resolvedAt || 'Pending'
        }));
    }

    async generateReport(type: string, filters: any, userId?: number, ipAddress?: string) {
        // AUDIT LOG
        await this.auditLogsService.create({
            action: 'GENERATE_REPORT',
            resource: 'Reports',
            details: `Generated ${type} report (Format: ${filters.format || 'summary'})`,
            status: 'SUCCESS',
            userId: userId || undefined,
            companyId: 0,
            ipAddress: ipAddress || '0.0.0.0'
        });

        const format = filters.format || 'summary';
        let data: any[] = [];

        // Check format
        const isExcel = format === 'excel';
        const isPdf = format === 'pdf';
        const fetchFormat = (isExcel || isPdf) ? 'detailed' : format;

        switch (type) {
            case 'Asset Inventory Report':
            case 'Asset Allocation Report':
                data = await this.getAssetReports(fetchFormat);
                break;
            case 'Employee Directory':
                data = await this.getEmployeeReports(fetchFormat);
                break;
            case 'Ticket Summary Report':
                data = await this.getTicketReports(fetchFormat);
                break;
            default:
                throw new Error('Report type not implemented');
        }

        if (isExcel) {
            const buffer = this.generateExcelBuffer(data);
            return {
                fileBuffer: buffer,
                fileName: `${type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            };
        }

        if (isPdf) {
            const buffer = this.generatePdfBuffer(data, type);
            return {
                fileBuffer: buffer,
                fileName: `${type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
                mimeType: 'application/pdf'
            };
        }

        return data;
    }
}
