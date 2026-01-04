import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { LocationsMasterEntity } from "../entities/location.entity";

@Injectable()
export class LocationRepository extends Repository<LocationsMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(LocationsMasterEntity, dataSource.createEntityManager());
    }
}
