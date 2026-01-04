import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './repositories/dashboard.repository';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { TicketsEntity } from '../tickets/entities/tickets.entity';
import { CompanyLicenseEntity } from '../licenses/entities/company-license.entity';

@Module({
    imports: [ TypeOrmModule.forFeature([ AssetInfoEntity, EmployeesEntity, TicketsEntity, CompanyLicenseEntity])],
    controllers: [DashboardController],
    providers: [DashboardService, DashboardRepository],
    exports: [DashboardService]
})
export class DashboardModule { }
