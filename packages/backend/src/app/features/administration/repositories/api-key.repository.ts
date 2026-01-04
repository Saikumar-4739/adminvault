import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { APIKeyEntity } from "../entities/api-key.entity";

@Injectable()
export class APIKeyRepository extends Repository<APIKeyEntity> {
    constructor(private dataSource: DataSource) {
        super(APIKeyEntity, dataSource.createEntityManager());
    }
}
