import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesEntity } from './entities/employees.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeesRepository } from './repositories/employees.repository';
import { EmployeesBulkService } from './employees-bulk.service';
import { DepartmentRepository } from '../masters/department/repositories/department.repository';

import { AdministrationModule } from '../administration/administration.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OnboardingModule } from '../onboarding/onboarding.module';

@Module({
    imports: [TypeOrmModule.forFeature([EmployeesEntity]), AdministrationModule, AuditLogModule, NotificationsModule, OnboardingModule],
    controllers: [EmployeesController],
    providers: [EmployeesService, EmployeesRepository, EmployeesBulkService, DepartmentRepository],
    exports: [EmployeesService, EmployeesRepository],
})
export class EmployeesModule { }
