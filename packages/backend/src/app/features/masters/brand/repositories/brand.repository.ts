import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DeviceConfigEntity } from "../entities/brand.entity";

@Injectable()
export class DeviceConfigRepository extends Repository<DeviceConfigEntity> {
    constructor(private dataSource: DataSource) {
        super(DeviceConfigEntity, dataSource.createEntityManager());
    }
}
