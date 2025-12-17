import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AssetTypeEntity } from "../../entities/masters/asset-type.entity";

@Injectable()
export class AssetTypeRepository extends Repository<AssetTypeEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetTypeEntity, dataSource.createEntityManager());
    }
}
