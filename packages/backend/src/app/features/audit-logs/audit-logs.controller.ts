import { Controller, Post, Body } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
    constructor(private readonly auditService: AuditLogsService) { }

    /**
     * Get all audit logs with pagination
     */
    @Post('get-all')
    @ApiOperation({ summary: 'Get all audit logs with pagination' })
    @ApiBody({ schema: { properties: { page: { type: 'number', default: 1 }, limit: { type: 'number', default: 50 } } } })
    async getLogs(@Body() body: { page?: number, limit?: number }) {
        try {
            const page = body.page || 1;
            const limit = body.limit || 50;
            const result = await this.auditService.findAll(page, limit);
            return {
                success: true,
                statusCode: 200,
                message: 'Audit logs retrieved successfully',
                ...result
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Get audit logs by user ID
     */
    @Post('get-by-user')
    @ApiOperation({ summary: 'Get audit logs by user ID' })
    @ApiBody({ schema: { properties: { userId: { type: 'number' }, page: { type: 'number', default: 1 }, limit: { type: 'number', default: 50 } } } })
    async getLogsByUser(@Body() body: { userId: number, page?: number, limit?: number }) {
        try {
            const page = body.page || 1;
            const limit = body.limit || 50;
            const result = await this.auditService.findByUser(body.userId, page, limit);
            return {
                success: true,
                statusCode: 200,
                message: `Audit logs for user ${body.userId} retrieved successfully`,
                ...result
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Get audit logs by action
     */
    @Post('get-by-action')
    @ApiOperation({ summary: 'Get audit logs by action' })
    @ApiBody({ schema: { properties: { action: { type: 'string' }, page: { type: 'number', default: 1 }, limit: { type: 'number', default: 50 } } } })
    async getLogsByAction(@Body() body: { action: string, page?: number, limit?: number }) {
        try {
            const page = body.page || 1;
            const limit = body.limit || 50;
            const result = await this.auditService.findByAction(body.action, page, limit);
            return {
                success: true,
                statusCode: 200,
                message: `Audit logs for action '${body.action}' retrieved successfully`,
                ...result
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Get audit logs by resource
     */
    @Post('get-by-resource')
    @ApiOperation({ summary: 'Get audit logs by resource' })
    @ApiBody({ schema: { properties: { resource: { type: 'string' }, page: { type: 'number', default: 1 }, limit: { type: 'number', default: 50 } } } })
    async getLogsByResource(@Body() body: { resource: string, page?: number, limit?: number }) {
        try {
            const page = body.page || 1;
            const limit = body.limit || 50;
            const result = await this.auditService.findByResource(body.resource, page, limit);
            return {
                success: true,
                statusCode: 200,
                message: `Audit logs for resource '${body.resource}' retrieved successfully`,
                ...result
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Get audit logs by status
     */
    @Post('get-by-status')
    @ApiOperation({ summary: 'Get audit logs by status' })
    @ApiBody({ schema: { properties: { status: { type: 'string' }, page: { type: 'number', default: 1 }, limit: { type: 'number', default: 50 } } } })
    async getLogsByStatus(@Body() body: { status: string, page?: number, limit?: number }) {
        try {
            const page = body.page || 1;
            const limit = body.limit || 50;
            const result = await this.auditService.findByStatus(body.status, page, limit);
            return {
                success: true,
                statusCode: 200,
                message: `Audit logs with status '${body.status}' retrieved successfully`,
                ...result
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Get audit logs by date range
     */
    @Post('get-by-date-range')
    @ApiOperation({ summary: 'Get audit logs by date range' })
    @ApiBody({ schema: { properties: { startDate: { type: 'string' }, endDate: { type: 'string' }, page: { type: 'number', default: 1 }, limit: { type: 'number', default: 50 } } } })
    async getLogsByDateRange(@Body() body: { startDate: string, endDate: string, page?: number, limit?: number }) {
        try {
            const page = body.page || 1;
            const limit = body.limit || 50;
            const start = new Date(body.startDate);
            const end = new Date(body.endDate);
            const result = await this.auditService.findByDateRange(start, end, page, limit);
            return {
                success: true,
                statusCode: 200,
                message: `Audit logs from ${body.startDate} to ${body.endDate} retrieved successfully`,
                ...result
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Advanced search with multiple filters
     */
    @Post('search')
    @ApiOperation({ summary: 'Advanced search with multiple filters' })
    @ApiBody({ schema: { type: 'object' } })
    async searchLogs(@Body() body: any) {
        try {
            const { page = 1, limit = 50, ...filters } = body;

            // Adjust types if needed, though body parsing usually handles basic types
            if (filters.startDate) filters.startDate = new Date(filters.startDate);
            if (filters.endDate) filters.endDate = new Date(filters.endDate);

            const result = await this.auditService.search(filters, page, limit);
            return {
                success: true,
                statusCode: 200,
                message: 'Audit logs search completed successfully',
                filters,
                ...result
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Get audit log statistics
     */
    @Post('get-statistics')
    @ApiOperation({ summary: 'Get audit log statistics' })
    @ApiBody({ schema: { properties: { companyId: { type: 'number' } } } })
    async getStatistics(@Body() body: { companyId?: number }) {
        try {
            const stats = await this.auditService.getStatistics(body.companyId);
            return {
                success: true,
                statusCode: 200,
                message: 'Audit log statistics retrieved successfully',
                data: stats
            };
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
