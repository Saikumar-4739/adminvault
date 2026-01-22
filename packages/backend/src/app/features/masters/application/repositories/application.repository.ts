import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ApplicationsMasterEntity } from "../entities/application.entity";

@Injectable()
export class ApplicationRepository extends Repository<ApplicationsMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(ApplicationsMasterEntity, dataSource.createEntityManager());
    }
}
