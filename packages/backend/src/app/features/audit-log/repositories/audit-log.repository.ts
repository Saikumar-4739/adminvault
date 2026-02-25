import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AuditLogEntity } from "../entities/audit-log.entity";

@Injectable()
export class AuditLogRepository extends Repository<AuditLogEntity> {
    constructor(private dataSource: DataSource) {
        super(AuditLogEntity, dataSource.createEntityManager());
    }
}
