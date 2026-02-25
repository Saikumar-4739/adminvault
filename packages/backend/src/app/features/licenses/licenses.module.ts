
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyLicenseEntity } from './entities/company-license.entity';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';
import { LicenseRepository } from './repositories/license.repository';

import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [TypeOrmModule.forFeature([CompanyLicenseEntity]), NotificationsModule],
    controllers: [LicensesController],
    providers: [LicensesService, LicenseRepository],
    exports: [LicensesService, LicenseRepository]
})
export class LicensesModule { }
