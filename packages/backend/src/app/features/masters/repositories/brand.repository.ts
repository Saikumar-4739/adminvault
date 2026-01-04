import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { BrandsMasterEntity } from "../entities/brand.entity";

@Injectable()
export class BrandRepository extends Repository<BrandsMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(BrandsMasterEntity, dataSource.createEntityManager());
    }
}
