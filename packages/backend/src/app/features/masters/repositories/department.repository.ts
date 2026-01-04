import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DepartmentsMasterEntity } from "../entities/department.entity";

@Injectable()
export class DepartmentRepository extends Repository<DepartmentsMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(DepartmentsMasterEntity, dataSource.createEntityManager());
    }
}
