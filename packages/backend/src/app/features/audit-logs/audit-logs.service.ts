import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLogEntity)
        private auditRepo: Repository<AuditLogEntity>
    ) { }

    async getLogs(userId: number, companyId: number): Promise<AuditLogEntity[]> {
        // If user is a super admin (no companyId or special logic), might return all.
        // For now, return logs accessible to this company.
        // Including global logs (master changes) might be noisy or security risk, 
        // so maybe restricting to companyId logs + user's own actions?

        // Simple approach: Return logs where companyId matches OR (companyId is null/global if we want to show master changes to everyone, but likely only admins checks that).
        // Let's stick to company isolation for business data.

        return await this.auditRepo.find({
            where: [
                { companyId: companyId }
            ],
            order: { createdAt: 'DESC' },
            take: 100 // Limit for safety
        });
    }

    async getAllLogsForAdmin(): Promise<AuditLogEntity[]> {
        return await this.auditRepo.find({
            order: { createdAt: 'DESC' },
            take: 200
        });
    }
}
