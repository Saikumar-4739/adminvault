import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { TicketCategoriesMasterEntity } from "../entities/ticket-category.entity";

@Injectable()
export class TicketCategoryRepository extends Repository<TicketCategoriesMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(TicketCategoriesMasterEntity, dataSource.createEntityManager());
    }
}
