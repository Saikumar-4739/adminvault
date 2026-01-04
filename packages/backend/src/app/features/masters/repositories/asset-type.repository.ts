import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AssetTypeMasterEntity } from "../entities/asset-type.entity";

@Injectable()
export class AssetTypeRepository extends Repository<AssetTypeMasterEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetTypeMasterEntity, dataSource.createEntityManager());
    }
}
