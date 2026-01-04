import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { EmployeesEntity } from "../entities/employees.entity";

@Injectable()
export class EmployeesRepository extends Repository<EmployeesEntity> {
    constructor(private dataSource: DataSource) {
        super(EmployeesEntity, dataSource.createEntityManager());
    }
}
