import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { CompanyLicenseEntity } from "../entities/company-license.entity";

@Injectable()
export class LicenseRepository extends Repository<CompanyLicenseEntity> {
    constructor(private dataSource: DataSource) {
        super(CompanyLicenseEntity, dataSource.createEntityManager());
    }
}
