import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { BrandEntity } from "../../entities/masters/brand.entity";

@Injectable()
export class BrandRepository extends Repository<BrandEntity> {
    constructor(private dataSource: DataSource) {
        super(BrandEntity, dataSource.createEntityManager());
    }
}
