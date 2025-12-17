import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { LocationEntity } from "../../entities/masters/location.entity";

@Injectable()
export class LocationRepository extends Repository<LocationEntity> {
    constructor(private dataSource: DataSource) {
        super(LocationEntity, dataSource.createEntityManager());
    }
}
