import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { PermissionEntity } from "../entities/permission.entity";

@Injectable()
export class PermissionRepository extends Repository<PermissionEntity> {
    constructor(private dataSource: DataSource) {
        super(PermissionEntity, dataSource.createEntityManager());
    }
}
