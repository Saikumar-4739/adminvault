import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AssetInfoEntity } from "../entities/asset-info.entity";

@Injectable()
export class AssetInfoRepository extends Repository<AssetInfoEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetInfoEntity, dataSource.createEntityManager());
    }
}
