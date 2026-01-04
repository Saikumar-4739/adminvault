
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyLicenseEntity } from '../../entities/company-license.entity';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CompanyLicenseEntity]),
        AuditLogsModule
    ],
    controllers: [LicensesController],
    providers: [LicensesService],
    exports: [LicensesService]
})
export class LicensesModule { }
