import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DeviceInfoEntity } from "../entities/device-info.entity";

@Injectable()
export class DeviceInfoRepository extends Repository<DeviceInfoEntity> {
    constructor(private dataSource: DataSource) {
        super(DeviceInfoEntity, dataSource.createEntityManager());
    }
}
