import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketStatusLogsEntity } from '../../entities/ticket-status-logs.entity';
import { TicketStatusLogsService } from './ticket-status-logs.service';
import { TicketStatusLogsController } from './ticket-status-logs.controller';
import { TicketStatusLogsRepository } from '../../repository/ticket-status-logs.repository';

@Module({
    imports: [TypeOrmModule.forFeature([TicketStatusLogsEntity])],
    controllers: [TicketStatusLogsController],
    providers: [TicketStatusLogsService, TicketStatusLogsRepository],
    exports: [TicketStatusLogsService],
})
export class TicketStatusLogsModule { }
