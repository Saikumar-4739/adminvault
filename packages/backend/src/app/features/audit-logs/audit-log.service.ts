import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) { }

    @OnEvent('audit.log')
    async createLog(payload: Partial<AuditLog>) {
        const log = this.auditLogRepository.create(payload);
        await this.auditLogRepository.save(log);
    }

    async findAll() {
        return this.auditLogRepository.find({
            order: {
                timestamp: 'DESC',
            },
            take: 100, // Limit to last 100 logs for now
        });
    }
}
