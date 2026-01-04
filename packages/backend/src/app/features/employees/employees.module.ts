import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesEntity } from '../../entities/employees.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeesRepository } from '../../repository/employees.repository';
import { EmployeesBulkService } from './employees-bulk.service';
import { DepartmentRepository } from '../../repository/masters/department.repository';

@Module({
    imports: [TypeOrmModule.forFeature([EmployeesEntity])],
    controllers: [EmployeesController],
    providers: [EmployeesService, EmployeesRepository, EmployeesBulkService, DepartmentRepository],
    exports: [EmployeesService],
})
export class EmployeesModule { }
