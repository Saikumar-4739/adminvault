import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { LicensesMasterEntity } from "../entities/license.entity";

@Injectable()
export class LicenseRepository extends Repository<LicensesMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(LicensesMasterEntity, dataSource.createEntityManager());
    }
}
