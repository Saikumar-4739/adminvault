
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { TicketsEntity } from '../tickets/entities/tickets.entity';

@Injectable()
export class ReportsService {
    constructor(
        private readonly dataSource: DataSource
    ) { }

    private generateExcelBuffer(data: any[]): Buffer {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        return buffer;
    }

    private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        // Approximate character width (this is a rough estimate)
        const charWidth = fontSize * 0.6;
        const maxCharsPerLine = Math.floor(maxWidth / charWidth);

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length <= maxCharsPerLine) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                }
                currentLine = word;
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines.length > 0 ? lines : [text.substring(0, maxCharsPerLine)];
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
            const fontSize = 7;
            const cellPadding = 3;
            const startY = height - 100;
            const startX = 50;
            const columnWidth = Math.min(120, (width - 100) / headers.length);
            const baseRowHeight = 18;

            let currentY = startY;

            // Calculate header height based on wrapped text
            const headerLines = headers.map(h => this.wrapText(h, columnWidth - (cellPadding * 2), fontSize));
            const maxHeaderLines = Math.max(...headerLines.map(lines => lines.length));
            const headerRowHeight = Math.max(baseRowHeight, maxHeaderLines * 10 + 6);

            // Draw header background
            page.drawRectangle({
                x: startX,
                y: currentY - headerRowHeight + 5,
                width: columnWidth * headers.length,
                height: headerRowHeight,
                color: rgb(0.95, 0.95, 0.97),
            });

            // Draw header borders and text
            headers.forEach((header, i) => {
                const x = startX + (i * columnWidth);

                // Draw cell border
                page.drawRectangle({
                    x: x,
                    y: currentY - headerRowHeight + 5,
                    width: columnWidth,
                    height: headerRowHeight,
                    borderColor: rgb(0.7, 0.7, 0.7),
                    borderWidth: 0.5,
                });

                // Draw header text (multi-line)
                const lines = headerLines[i];
                lines.forEach((line, lineIdx) => {
                    page.drawText(line, {
                        x: x + cellPadding,
                        y: currentY - headerRowHeight + headerRowHeight - 8 - (lineIdx * 10),
                        size: fontSize,
                        font: boldFont,
                        color: rgb(0.2, 0.2, 0.2),
                    });
                });
            });

            currentY -= headerRowHeight;

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
                    const x = startX + (colIdx * columnWidth);

                    // Draw cell border
                    page.drawRectangle({
                        x: x,
                        y: currentY - baseRowHeight + 5,
                        width: columnWidth,
                        height: baseRowHeight,
                        borderColor: rgb(0.8, 0.8, 0.8),
                        borderWidth: 0.5,
                        color: rgb(1, 1, 1), // White background
                    });

                    const cellValue = row[header];
                    const text = cellValue !== null && cellValue !== undefined
                        ? String(cellValue)
                        : '-';

                    // Wrap text if needed
                    const cellLines = this.wrapText(text, columnWidth - (cellPadding * 2), fontSize);
                    const displayText = cellLines[0]; // Show only first line for data cells

                    // Draw cell text
                    page.drawText(displayText, {
                        x: x + cellPadding,
                        y: currentY - baseRowHeight + 10,
                        size: fontSize,
                        font: timesRomanFont,
                        color: rgb(0, 0, 0),
                    });
                });

                currentY -= baseRowHeight;
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

    async getAssetReports(format = 'summary') {
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

    async getAssetAllocationReports(format = 'summary') {
        // Query only for allocated assets (where assigned_to_employee_id is not null)
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
                e1.ph_number AS assignedPhone,
                dept.name AS assignedDepartment,
                CONCAT(e2.first_name, ' ', e2.last_name) AS previousUser
            FROM asset_info a
            LEFT JOIN device_info d ON a.device_id = d.id
            LEFT JOIN device_brands b ON a.brand_id = b.id
            INNER JOIN employees e1 ON a.assigned_to_employee_id = e1.id
            LEFT JOIN departments dept ON e1.department_id = dept.id
            LEFT JOIN employees e2 ON a.previous_user_employee_id = e2.id
            WHERE a.assigned_to_employee_id IS NOT NULL
            ORDER BY e1.first_name, e1.last_name, a.id DESC
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
            'Assigned To': asset.assignedTo,
            'Assigned Employee Email': asset.assignedEmail || 'N/A',
            'Assigned Employee Phone': asset.assignedPhone || 'N/A',
            'Department': asset.assignedDepartment || 'N/A',
            'User Assigned Date': asset.userAssignedDate || 'N/A',
            'Previous User': asset.previousUser || 'N/A',
            'Purchase Date': asset.purchaseDate || 'N/A',
            'Warranty Expiry': asset.warrantyExpiry || 'N/A',
            'Last Return Date': asset.lastReturnDate || 'N/A',
            'Created At': asset.createdAt,
            'Updated At': asset.updatedAt,
        }));

        return formattedAssets;
    }

    async getEmployeeReports(format = 'summary') {
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

    async getTicketReports(format = 'summary') {
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

    // New Asset Reports
    async getAssetWarrantyExpiryReport(format = 'summary') {
        const query = `
            SELECT 
                a.id AS assetId,
                a.serial_number AS serialNumber,
                a.express_code AS expressCode,
                a.model,
                a.warranty_expiry AS warrantyExpiry,
                a.purchase_date AS purchaseDate,
                d.device_name AS deviceName,
                b.name AS brandName,
                CONCAT(e1.first_name, ' ', e1.last_name) AS assignedTo,
                (a.warranty_expiry - CURRENT_DATE) AS daysUntilExpiry
            FROM asset_info a
            LEFT JOIN device_info d ON a.device_id = d.id
            LEFT JOIN device_brands b ON a.brand_id = b.id
            LEFT JOIN employees e1 ON a.assigned_to_employee_id = e1.id
            WHERE a.warranty_expiry IS NOT NULL 
            AND a.warranty_expiry >= CURRENT_DATE
            ORDER BY a.warranty_expiry ASC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((asset: any) => ({
            'Asset ID': asset.assetId,
            'Serial Number': asset.serialNumber,
            'Express Code': asset.expressCode || 'N/A',
            'Device Type': asset.deviceName || 'N/A',
            'Brand': asset.brandName || 'N/A',
            'Model': asset.model || 'N/A',
            'Assigned To': asset.assignedTo || 'Unassigned',
            'Purchase Date': asset.purchaseDate || 'N/A',
            'Warranty Expiry': asset.warrantyExpiry,
            'Days Until Expiry': asset.daysUntilExpiry
        }));
    }

    async getAssetByDepartmentReport(format = 'summary') {
        const query = `
            SELECT 
                dept.name AS departmentName,
                d.device_name AS deviceName,
                b.name AS brandName,
                COUNT(a.id) AS assetCount,
                STRING_AGG(a.serial_number, ', ') AS serialNumbers
            FROM asset_info a
            INNER JOIN employees e ON a.assigned_to_employee_id = e.id
            INNER JOIN departments dept ON e.department_id = dept.id
            LEFT JOIN device_info d ON a.device_id = d.id
            LEFT JOIN device_brands b ON a.brand_id = b.id
            WHERE a.assigned_to_employee_id IS NOT NULL
            GROUP BY dept.name, d.device_name, b.name
            ORDER BY dept.name, assetCount DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'Department': row.departmentName,
            'Device Type': row.deviceName || 'N/A',
            'Brand': row.brandName || 'N/A',
            'Asset Count': row.assetCount,
            'Serial Numbers': row.serialNumbers
        }));
    }

    async getAssetByDeviceTypeReport(format = 'summary') {
        const query = `
            SELECT 
                d.device_name AS deviceName,
                b.name AS brandName,
                a.model,
                a.asset_status_enum AS status,
                COUNT(a.id) AS totalAssets,
                SUM(CASE WHEN a.assigned_to_employee_id IS NOT NULL THEN 1 ELSE 0 END) AS assignedCount,
                SUM(CASE WHEN a.assigned_to_employee_id IS NULL THEN 1 ELSE 0 END) AS unassignedCount
            FROM asset_info a
            LEFT JOIN device_info d ON a.device_id = d.id
            LEFT JOIN device_brands b ON a.brand_id = b.id
            GROUP BY d.device_name, b.name, a.model, a.asset_status_enum
            ORDER BY d.device_name, totalAssets DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'Device Type': row.deviceName || 'N/A',
            'Brand': row.brandName || 'N/A',
            'Model': row.model || 'N/A',
            'Status': row.status,
            'Total Assets': row.totalAssets,
            'Assigned': row.assignedCount,
            'Unassigned': row.unassignedCount
        }));
    }

    async getUnassignedAssetsReport(format = 'summary') {
        const query = `
            SELECT 
                a.id AS assetId,
                a.serial_number AS serialNumber,
                a.express_code AS expressCode,
                a.model,
                a.configuration,
                a.asset_status_enum AS status,
                a.purchase_date AS purchaseDate,
                d.device_name AS deviceName,
                b.name AS brandName
            FROM asset_info a
            LEFT JOIN device_info d ON a.device_id = d.id
            LEFT JOIN device_brands b ON a.brand_id = b.id
            WHERE a.assigned_to_employee_id IS NULL
            ORDER BY a.created_at DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((asset: any) => ({
            'Asset ID': asset.assetId,
            'Serial Number': asset.serialNumber,
            'Express Code': asset.expressCode || 'N/A',
            'Device Type': asset.deviceName || 'N/A',
            'Brand': asset.brandName || 'N/A',
            'Model': asset.model || 'N/A',
            'Configuration': asset.configuration || 'N/A',
            'Status': asset.status,
            'Purchase Date': asset.purchaseDate || 'N/A'
        }));
    }

    // Employee Reports
    async getEmployeesByDepartmentReport(format = 'summary') {
        const query = `
            SELECT 
                dept.name AS departmentName,
                COUNT(e.id) AS employeeCount,
                STRING_AGG(CONCAT(e.first_name, ' ', e.last_name), ', ') AS employees
            FROM employees e
            LEFT JOIN departments dept ON e.department_id = dept.id
            GROUP BY dept.name
            ORDER BY employeeCount DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'Department': row.departmentName || 'Unassigned',
            'Employee Count': row.employeeCount,
            'Employees': row.employees
        }));
    }

    // Ticket Reports
    async getOpenTicketsReport(format = 'summary') {
        const query = `
            SELECT 
                t.ticket_code AS ticketCode,
                t.subject,
                t.priority_enum AS priority,
                t.category_enum AS category,
                t.ticket_status AS status,
                t.created_at AS createdAt,
                CONCAT(e1.first_name, ' ', e1.last_name) AS raisedBy,
                CONCAT(e2.first_name, ' ', e2.last_name) AS assignedTo,
                (CURRENT_DATE - t.created_at::date) AS daysOpen
            FROM tickets t
            LEFT JOIN employees e1 ON t.employee_id = e1.id
            LEFT JOIN employees e2 ON t.assign_admin_id = e2.id
            WHERE t.ticket_status != 'Resolved' AND t.ticket_status != 'Closed'
            ORDER BY t.priority_enum DESC, t.created_at ASC
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
            'Days Open': t.daysOpen
        }));
    }

    async getResolvedTicketsReport(format = 'summary') {
        const query = `
            SELECT 
                t.ticket_code AS ticketCode,
                t.subject,
                t.priority_enum AS priority,
                t.category_enum AS category,
                t.created_at AS createdAt,
                t.resolved_at AS resolvedAt,
                CONCAT(e1.first_name, ' ', e1.last_name) AS raisedBy,
                CONCAT(e2.first_name, ' ', e2.last_name) AS resolvedBy,
                (t.resolved_at::date - t.created_at::date) AS resolutionDays
            FROM tickets t
            LEFT JOIN employees e1 ON t.employee_id = e1.id
            LEFT JOIN employees e2 ON t.assign_admin_id = e2.id
            WHERE t.ticket_status = 'Resolved' OR t.ticket_status = 'Closed'
            ORDER BY t.resolved_at DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((t: any) => ({
            'Ticket Code': t.ticketCode,
            'Subject': t.subject,
            'Priority': t.priority,
            'Category': t.category,
            'Raised By': t.raisedBy || 'Unknown',
            'Resolved By': t.resolvedBy || 'Unknown',
            'Created At': t.createdAt,
            'Resolved At': t.resolvedAt,
            'Resolution Days': t.resolutionDays
        }));
    }

    async getTicketsByPriorityReport(format = 'summary') {
        const query = `
            SELECT 
                t.priority_enum AS priority,
                t.ticket_status AS status,
                COUNT(t.id) AS ticketCount,
                AVG(COALESCE(t.resolved_at::date, CURRENT_DATE) - t.created_at::date) AS avgResolutionDays
            FROM tickets t
            GROUP BY t.priority_enum, t.ticket_status
            ORDER BY 
                CASE t.priority_enum
                    WHEN 'Critical' THEN 1
                    WHEN 'High' THEN 2
                    WHEN 'Medium' THEN 3
                    WHEN 'Low' THEN 4
                    ELSE 5
                END,
                t.ticket_status
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'Priority': row.priority,
            'Status': row.status,
            'Ticket Count': row.ticketCount,
            'Avg Resolution Days': Math.round(row.avgResolutionDays || 0)
        }));
    }

    async getTicketsByCategoryReport(format = 'summary') {
        const query = `
            SELECT 
                t.category_enum AS category,
                t.ticket_status AS status,
                COUNT(t.id) AS ticketCount,
                AVG(COALESCE(t.resolved_at::date, CURRENT_DATE) - t.created_at::date) AS avgResolutionDays
            FROM tickets t
            GROUP BY t.category_enum, t.ticket_status
            ORDER BY ticketCount DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'Category': row.category,
            'Status': row.status,
            'Ticket Count': row.ticketCount,
            'Avg Resolution Days': Math.round(row.avgResolutionDays || 0)
        }));
    }

    // Master Data Reports
    async getDepartmentSummaryReport(format = 'summary') {
        const query = `
            SELECT 
                d.name AS departmentName,
                COUNT(DISTINCT e.id) AS employeeCount,
                COUNT(DISTINCT a.id) AS assetCount
            FROM departments d
            LEFT JOIN employees e ON d.id = e.department_id
            LEFT JOIN asset_info a ON e.id = a.assigned_to_employee_id
            GROUP BY d.name
            ORDER BY employeeCount DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'Department': row.departmentName,
            'Employee Count': row.employeeCount,
            'Asset Count': row.assetCount
        }));
    }

    async getLicenseReports(format = 'summary') {
        const query = `
            SELECT 
                l.id,
                l.assigned_date AS assignedDate,
                l.expiry_date AS expiryDate,
                l.remarks,
                c.company_name AS companyName,
                a.name AS softwareName,
                CONCAT(e.first_name, ' ', e.last_name) AS assignedEmployee
            FROM licenses l
            LEFT JOIN company_info c ON l.company_id = c.id
            LEFT JOIN applications a ON l.application_id = a.id
            LEFT JOIN employees e ON l.assigned_employee_id = e.id
            ORDER BY l.created_at DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'ID': row.id,
            'Software': row.softwareName || 'N/A',
            'Company': row.companyName || 'N/A',
            'Assigned Employee': row.assignedEmployee || 'Unassigned',
            'Assigned Date': row.assignedDate || 'N/A',
            'Expiry Date': row.expiryDate || 'N/A',
            'Remarks': row.remarks || '---'
        }));
    }

    async getDeviceBrandsReport(format = 'summary') {
        const query = `
            SELECT 
                b.name AS brandName,
                d.device_name AS deviceType,
                COUNT(a.id) AS assetCount
            FROM device_brands b
            LEFT JOIN asset_info a ON b.id = a.brand_id
            LEFT JOIN device_info d ON a.device_id = d.id
            GROUP BY b.name, d.device_name
            ORDER BY assetCount DESC
        `;

        const rawResults = await this.dataSource.query(query);

        return rawResults.map((row: any) => ({
            'Brand': row.brandName,
            'Device Type': row.deviceType || 'N/A',
            'Asset Count': row.assetCount
        }));
    }

    async generateReport(type: string, filters: any, userId?: number, ipAddress?: string) {
        const format = filters.format || 'summary';
        let data: any[] = [];

        // Check format
        const isExcel = format === 'excel';
        const isPdf = format === 'pdf';
        const fetchFormat = (isExcel || isPdf) ? 'detailed' : format;

        switch (type) {
            case 'Asset Inventory Report':
                data = await this.getAssetReports(fetchFormat);
                break;
            case 'Asset Allocation Report':
                data = await this.getAssetAllocationReports(fetchFormat);
                break;
            case 'Asset Warranty Expiry Report':
                data = await this.getAssetWarrantyExpiryReport(fetchFormat);
                break;
            case 'Asset by Department Report':
                data = await this.getAssetByDepartmentReport(fetchFormat);
                break;
            case 'Asset by Device Type Report':
                data = await this.getAssetByDeviceTypeReport(fetchFormat);
                break;
            case 'Unassigned Assets Report':
                data = await this.getUnassignedAssetsReport(fetchFormat);
                break;
            case 'Employee Directory':
                data = await this.getEmployeeReports(fetchFormat);
                break;
            case 'Employees by Department Report':
                data = await this.getEmployeesByDepartmentReport(fetchFormat);
                break;
            case 'License Assignment Report':
                data = await this.getLicenseReports(fetchFormat);
                break;
            case 'Ticket Summary Report':
                data = await this.getTicketReports(fetchFormat);
                break;
            case 'Open Tickets Report':
                data = await this.getOpenTicketsReport(fetchFormat);
                break;
            case 'Resolved Tickets Report':
                data = await this.getResolvedTicketsReport(fetchFormat);
                break;
            case 'Tickets by Priority Report':
                data = await this.getTicketsByPriorityReport(fetchFormat);
                break;
            case 'Tickets by Category Report':
                data = await this.getTicketsByCategoryReport(fetchFormat);
                break;
            case 'Department Summary Report':
                data = await this.getDepartmentSummaryReport(fetchFormat);
                break;
            case 'Device Brands Report':
                data = await this.getDeviceBrandsReport(fetchFormat);
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
            const buffer = await this.generatePdfBuffer(data, type);
            return {
                fileBuffer: buffer,
                fileName: `${type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
                mimeType: 'application/pdf'
            };
        }

        return data;
    }
}
