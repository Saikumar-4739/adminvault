import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketCategoryService } from './ticket-category.service';
import { TicketCategoryController } from './ticket-category.controller';
import { TicketCategoriesMasterEntity } from './entities/ticket-category.entity';
import { TicketCategoryRepository } from './repositories/ticket-category.repository';

@Module({
    imports: [TypeOrmModule.forFeature([TicketCategoriesMasterEntity])],
    controllers: [TicketCategoryController],
    providers: [TicketCategoryService, TicketCategoryRepository],
    exports: [TicketCategoryService],
})
export class TicketCategoryModule { }
