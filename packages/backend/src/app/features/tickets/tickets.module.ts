import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsEntity } from '../../entities/tickets.entity';
import { TicketsRepository } from '../../repository';

@Module({
    imports: [TypeOrmModule.forFeature([TicketsEntity])],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository],
    exports: [TicketsService],
})
export class TicketsModule { }
