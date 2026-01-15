import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ScopeEntity } from "../entities/scope.entity";

@Injectable()
export class ScopeRepository extends Repository<ScopeEntity> {
    constructor(private dataSource: DataSource) {
        super(ScopeEntity, dataSource.createEntityManager());
    }
}
