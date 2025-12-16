import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AssetAssignEntity } from "../entities/asset-assign.entity";

@Injectable()
export class AssetAssignRepository extends Repository<AssetAssignEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetAssignEntity, dataSource.createEntityManager());
    }
}
