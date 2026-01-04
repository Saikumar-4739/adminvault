import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { RoleEntity } from "../entities/role.entity";

@Injectable()
export class RoleRepository extends Repository<RoleEntity> {
    constructor(private dataSource: DataSource) {
        super(RoleEntity, dataSource.createEntityManager());
    }
}
