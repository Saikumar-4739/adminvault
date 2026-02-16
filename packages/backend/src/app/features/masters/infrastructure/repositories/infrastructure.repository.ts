import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InfrastructureMasterEntity } from "../entities/infrastructure.entity";

@Injectable()
export class InfrastructureRepository extends Repository<InfrastructureMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(InfrastructureMasterEntity, dataSource.createEntityManager());
    }
}
