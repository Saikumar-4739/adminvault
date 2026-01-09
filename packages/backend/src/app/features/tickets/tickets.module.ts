import { Module, forwardRef } from '@nestjs/common';
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


import { TicketsGateway } from './tickets.gateway';
import { TicketMessageEntity } from './entities/ticket-messages.entity';
import { AuthUsersEntity } from '../auth-users/entities/auth-users.entity';
import { AdministrationModule } from '../administration/administration.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { TicketWorkLogEntity } from './entities/ticket-work-log.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TicketsEntity,
            TicketCommentsEntity,
            TicketStatusLogsEntity,
            EmployeesEntity,
            TicketMessageEntity,
            AuthUsersEntity,
            TicketWorkLogEntity
        ]),
        AdministrationModule,
        forwardRef(() => WorkflowModule)
    ],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository, TicketCommentsRepository, TicketStatusLogsRepository, EmployeesRepository, TicketsGateway],
    exports: [TicketsService],
})
export class TicketsModule { }
