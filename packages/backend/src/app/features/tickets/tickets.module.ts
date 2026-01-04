import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsEntity } from '../../entities/tickets.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import { TicketsRepository, EmployeesRepository } from '../../repository';

import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([TicketsEntity, EmployeesEntity]),
        AuditLogsModule
    ],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository, EmployeesRepository],
    exports: [TicketsService],
})
export class TicketsModule { }
