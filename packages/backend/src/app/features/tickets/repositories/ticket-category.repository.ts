
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TicketCategoryEntity } from '../entities/masters/ticket-category.entity';

@Injectable()
export class TicketCategoryRepository extends Repository<TicketCategoryEntity> {
    constructor(private dataSource: DataSource) {
        super(TicketCategoryEntity, dataSource.createEntityManager());
    }
}
