import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { CompanyInfoEntity } from "../entities/company-info.entity";

@Injectable()
export class CompanyInfoRepository extends Repository<CompanyInfoEntity> {
    constructor(private dataSource: DataSource) {
        super(CompanyInfoEntity, dataSource.createEntityManager());
    }
}
