import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsEntity } from './entities/tickets.entity';
import { TicketCommentsEntity } from './entities/ticket-comments.entity';
import { TicketStatusLogsEntity } from './entities/ticket-status-logs.entity';
import { EmployeesEntity } from '../employees/entities/employees.entity';
import { TicketsRepository } from './repositories/tickets.repository';
import { TicketCommentsRepository } from './repositories/ticket-comments.repository';
import { TicketStatusLogsRepository } from './repositories/ticket-status-logs.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';


@Module({
    imports: [
        TypeOrmModule.forFeature([TicketsEntity, TicketCommentsEntity, TicketStatusLogsEntity, EmployeesEntity])
    ],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository, TicketCommentsRepository, TicketStatusLogsRepository, EmployeesRepository],
    exports: [TicketsService],
})
export class TicketsModule { }
