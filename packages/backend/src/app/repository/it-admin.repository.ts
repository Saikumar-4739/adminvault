import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ItAdminEntity } from "../entities/it-admin.entity";

@Injectable()
export class ItAdminRepository extends Repository<ItAdminEntity> {
    constructor(private dataSource: DataSource) {
        super(ItAdminEntity, dataSource.createEntityManager());
    }
}
