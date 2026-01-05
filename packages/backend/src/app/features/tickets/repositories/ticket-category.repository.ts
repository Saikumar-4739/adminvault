
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TicketCategoriesMasterEntity } from '../../masters/entities/ticket-category.entity';

@Injectable()
export class TicketCategoryRepository extends Repository<TicketCategoriesMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(TicketCategoriesMasterEntity, dataSource.createEntityManager());
    }
}
