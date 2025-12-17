import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { DepartmentEntity } from "../../entities/masters/department.entity";

@Injectable()
export class DepartmentRepository extends Repository<DepartmentEntity> {
    constructor(private dataSource: DataSource) {
        super(DepartmentEntity, dataSource.createEntityManager());
    }
}
