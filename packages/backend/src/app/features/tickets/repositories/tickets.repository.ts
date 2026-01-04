import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { TicketsEntity } from "../entities/tickets.entity";

@Injectable()
export class TicketsRepository extends Repository<TicketsEntity> {
    constructor(private dataSource: DataSource) {
        super(TicketsEntity, dataSource.createEntityManager());
    }
}
