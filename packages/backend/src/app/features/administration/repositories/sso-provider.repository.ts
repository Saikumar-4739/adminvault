import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { SSOProviderEntity } from "../entities/sso-provider.entity";

@Injectable()
export class SSOProviderRepository extends Repository<SSOProviderEntity> {
    constructor(private dataSource: DataSource) {
        super(SSOProviderEntity, dataSource.createEntityManager());
    }
}
