import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ContractEntity } from "../entities/contract.entity";

@Injectable()
export class ContractRepository extends Repository<ContractEntity> {
    constructor(private dataSource: DataSource) {
        super(ContractEntity, dataSource.createEntityManager());
    }
}
