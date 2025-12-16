import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { TicketStatusLogsEntity } from "../entities/ticket-status-logs.entity";

@Injectable()
export class TicketStatusLogsRepository extends Repository<TicketStatusLogsEntity> {
    constructor(private dataSource: DataSource) {
        super(TicketStatusLogsEntity, dataSource.createEntityManager());
    }
}
