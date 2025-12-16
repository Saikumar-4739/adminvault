import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { TicketCommentsEntity } from "../entities/ticket-comments.entity";

@Injectable()
export class TicketCommentsRepository extends Repository<TicketCommentsEntity> {
    constructor(private dataSource: DataSource) {
        super(TicketCommentsEntity, dataSource.createEntityManager());
    }
}
