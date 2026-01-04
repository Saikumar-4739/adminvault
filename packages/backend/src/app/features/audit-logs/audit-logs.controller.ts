import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
export class AuditLogsController {
    constructor(private readonly auditService: AuditLogsService) { }

    /**
     * Get all audit logs with pagination
     * GET /audit-logs?page=1&limit=50
     */
    @Get()
    async getLogs(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
    ) {
        const result = await this.auditService.findAll(page, limit);
        return {
            success: true,
            statusCode: 200,
            message: 'Audit logs retrieved successfully',
            ...result
        };
    }

    /**
     * Get audit logs by user ID
     * GET /audit-logs/user/:userId?page=1&limit=50
     */
    @Get('user/:userId')
    async getLogsByUser(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
    ) {
        const result = await this.auditService.findByUser(userId, page, limit);
        return {
            success: true,
            statusCode: 200,
            message: `Audit logs for user ${userId} retrieved successfully`,
            ...result
        };
    }

    /**
     * Get audit logs by action
     * GET /audit-logs/action?action=LOGIN_SUCCESS&page=1&limit=50
     */
    @Get('action')
    async getLogsByAction(
        @Query('action') action: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
    ) {
        const result = await this.auditService.findByAction(action, page, limit);
        return {
            success: true,
            statusCode: 200,
            message: `Audit logs for action '${action}' retrieved successfully`,
            ...result
        };
    }

    /**
     * Get audit logs by resource
     * GET /audit-logs/resource?resource=Asset&page=1&limit=50
     */
    @Get('resource')
    async getLogsByResource(
        @Query('resource') resource: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
    ) {
        const result = await this.auditService.findByResource(resource, page, limit);
        return {
            success: true,
            statusCode: 200,
            message: `Audit logs for resource '${resource}' retrieved successfully`,
            ...result
        };
    }

    /**
     * Get audit logs by status
     * GET /audit-logs/status?status=SUCCESS&page=1&limit=50
     */
    @Get('status')
    async getLogsByStatus(
        @Query('status') status: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
    ) {
        const result = await this.auditService.findByStatus(status, page, limit);
        return {
            success: true,
            statusCode: 200,
            message: `Audit logs with status '${status}' retrieved successfully`,
            ...result
        };
    }

    /**
     * Get audit logs by date range
     * GET /audit-logs/date-range?startDate=2024-01-01&endDate=2024-12-31&page=1&limit=50
     */
    @Get('date-range')
    async getLogsByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
    ) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const result = await this.auditService.findByDateRange(start, end, page, limit);
        return {
            success: true,
            statusCode: 200,
            message: `Audit logs from ${startDate} to ${endDate} retrieved successfully`,
            ...result
        };
    }

    /**
     * Advanced search with multiple filters
     * GET /audit-logs/search?userId=1&action=LOGIN&resource=Auth&status=SUCCESS&startDate=2024-01-01&endDate=2024-12-31&ipAddress=192.168.1.1&companyId=1&page=1&limit=50
     */
    @Get('search')
    async searchLogs(
        @Query('userId') userId?: string,
        @Query('action') action?: string,
        @Query('resource') resource?: string,
        @Query('status') status?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('ipAddress') ipAddress?: string,
        @Query('companyId') companyId?: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number
    ) {
        const filters: any = {};

        if (userId) filters.userId = parseInt(userId);
        if (action) filters.action = action;
        if (resource) filters.resource = resource;
        if (status) filters.status = status;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);
        if (ipAddress) filters.ipAddress = ipAddress;
        if (companyId) filters.companyId = parseInt(companyId);

        const result = await this.auditService.search(filters, page, limit);
        return {
            success: true,
            statusCode: 200,
            message: 'Audit logs search completed successfully',
            filters,
            ...result
        };
    }

    /**
     * Get audit log statistics
     * GET /audit-logs/statistics?companyId=1
     */
    @Get('statistics')
    async getStatistics(@Query('companyId') companyId?: string) {
        const stats = await this.auditService.getStatistics(companyId ? parseInt(companyId) : undefined);
        return {
            success: true,
            statusCode: 200,
            message: 'Audit log statistics retrieved successfully',
            data: stats
        };
    }
}
