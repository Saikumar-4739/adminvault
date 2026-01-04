import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLogEntity, AuthUsersEntity])],
    controllers: [AuditLogsController],
    providers: [AuditLogsService],
    exports: [AuditLogsService]
})
export class AuditLogsModule { }
