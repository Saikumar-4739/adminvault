import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AuditLogEntity } from '../../entities/audit-log.entity';

@Injectable()
export class AuditLogsService implements OnModuleInit {
    constructor(private readonly dataSource: DataSource) { }


    async onModuleInit() {
        // Log system startup
        await this.logSystemStartup();
    }

    /**
     * Get all audit logs with pagination
     */
    async findAll(page: number = 1, limit: number = 50) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        const skip = (page - 1) * limit;

        const [logs, total] = await repo.findAndCount({
            order: { createdAt: 'DESC' },
            take: limit,
            skip
        });

        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Create a new audit log entry
     */
    async create(data: Partial<AuditLogEntity>) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        return repo.save(data);
    }


    /**
     * Find logs by user ID
     */
    async findByUser(userId: number, page: number = 1, limit: number = 50) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        const skip = (page - 1) * limit;

        const [logs, total] = await repo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip
        });

        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Find logs by action type
     */
    async findByAction(action: string, page: number = 1, limit: number = 50) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        const skip = (page - 1) * limit;

        const [logs, total] = await repo.findAndCount({
            where: { action },
            order: { createdAt: 'DESC' },
            take: limit,
            skip
        });

        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Find logs by resource
     */
    async findByResource(resource: string, page: number = 1, limit: number = 50) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        const skip = (page - 1) * limit;

        const [logs, total] = await repo.findAndCount({
            where: { resource },
            order: { createdAt: 'DESC' },
            take: limit,
            skip
        });

        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Find logs by status
     */
    async findByStatus(status: string, page: number = 1, limit: number = 50) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        const skip = (page - 1) * limit;

        const [logs, total] = await repo.findAndCount({
            where: { status },
            order: { createdAt: 'DESC' },
            take: limit,
            skip
        });

        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Find logs within a date range
     */
    async findByDateRange(startDate: Date, endDate: Date, page: number = 1, limit: number = 50) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        const skip = (page - 1) * limit;

        const query = repo.createQueryBuilder('audit_logs')
            .where('audit_logs.created_at >= :startDate', { startDate })
            .andWhere('audit_logs.created_at <= :endDate', { endDate })
            .orderBy('audit_logs.created_at', 'DESC')
            .skip(skip)
            .take(limit);

        const [logs, total] = await query.getManyAndCount();

        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Advanced search with multiple filters
     */
    async search(filters: {
        userId?: number;
        action?: string;
        resource?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        ipAddress?: string;
        companyId?: number;
    }, page: number = 1, limit: number = 50) {
        const repo = this.dataSource.getRepository(AuditLogEntity);
        const skip = (page - 1) * limit;

        const query = repo.createQueryBuilder('audit_logs');

        if (filters.userId) {
            query.andWhere('audit_logs.user_id = :userId', { userId: filters.userId });
        }
        if (filters.action) {
            query.andWhere('audit_logs.action = :action', { action: filters.action });
        }
        if (filters.resource) {
            query.andWhere('audit_logs.resource = :resource', { resource: filters.resource });
        }
        if (filters.status) {
            query.andWhere('audit_logs.status = :status', { status: filters.status });
        }
        if (filters.ipAddress) {
            query.andWhere('audit_logs.ip_address = :ipAddress', { ipAddress: filters.ipAddress });
        }
        if (filters.companyId) {
            query.andWhere('audit_logs.company_id = :companyId', { companyId: filters.companyId });
        }
        if (filters.startDate) {
            query.andWhere('audit_logs.created_at >= :startDate', { startDate: filters.startDate });
        }
        if (filters.endDate) {
            query.andWhere('audit_logs.created_at <= :endDate', { endDate: filters.endDate });
        }

        query.orderBy('audit_logs.created_at', 'DESC')
            .skip(skip)
            .take(limit);

        const [logs, total] = await query.getManyAndCount();

        return {
            data: logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Get audit log statistics
     */
    async getStatistics(companyId?: number) {
        const repo = this.dataSource.getRepository(AuditLogEntity);

        const query = repo.createQueryBuilder('audit_logs');

        if (companyId) {
            query.where('audit_logs.company_id = :companyId', { companyId });
        }

        const total = await query.getCount();
        const successCount = await query.clone().andWhere('audit_logs.status = :status', { status: 'SUCCESS' }).getCount();
        const failureCount = await query.clone().andWhere('audit_logs.status = :status', { status: 'FAILURE' }).getCount();

        // Get action distribution
        const actionStats = await repo
            .createQueryBuilder('audit_logs')
            .select('audit_logs.action', 'action')
            .addSelect('COUNT(*)', 'count')
            .groupBy('audit_logs.action')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();

        return {
            total,
            successCount,
            failureCount,
            successRate: total > 0 ? ((successCount / total) * 100).toFixed(2) : 0,
            topActions: actionStats
        };
    }

    /**
     * Log system startup
     */
    private async logSystemStartup() {
        try {
            const repo = this.dataSource.getRepository(AuditLogEntity);
            await repo.save({
                action: 'SYSTEM_STARTUP',
                resource: 'System',
                details: 'Backend service started successfully',
                status: 'SUCCESS',
                ipAddress: 'localhost',
                companyId: 1
            });
            console.log('✅ System startup logged to audit logs');
        } catch (error) {
            console.error('Failed to log system startup:', error);
        }
    }
}
