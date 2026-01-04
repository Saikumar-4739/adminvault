import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailInfoEntity } from '../../entities/email-info.entity';
import { EmailInfoService } from './email-info.service';
import { EmailInfoController } from './email-info.controller';
import { EmailInfoRepository } from '../../repository/email-info.repository';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EmailInfoEntity]),
        AuditLogsModule
    ],
    controllers: [EmailInfoController],
    providers: [EmailInfoService, EmailInfoRepository],
    exports: [EmailInfoService],
})
export class EmailInfoModule { }
