import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketCommentsEntity } from '../../entities/ticket-comments.entity';
import { TicketCommentsService } from './ticket-comments.service';
import { TicketCommentsController } from './ticket-comments.controller';
import { TicketCommentsRepository } from '../../repository/ticket-comments.repository';

@Module({
    imports: [TypeOrmModule.forFeature([TicketCommentsEntity])],
    controllers: [TicketCommentsController],
    providers: [TicketCommentsService, TicketCommentsRepository],
    exports: [TicketCommentsService],
})
export class TicketCommentsModule { }
