import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogController } from './audit-logs.controller';
import { AuditLogService } from './audit-logs.service';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuditLogSubscriber } from './subscribers/audit-log.subscriber';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuditLogEntity])
    ],
    controllers: [AuditLogController],
    providers: [
        AuditLogService,
        AuditLogSubscriber
    ],
    exports: [AuditLogService]
})
export class AuditLogsModule {
    constructor(private subscriber: AuditLogSubscriber) { }
}
