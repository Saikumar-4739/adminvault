import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AssetReturnHistoryEntity } from '../entities/asset-return-history.entity';

@Injectable()
export class AssetReturnHistoryRepository extends Repository<AssetReturnHistoryEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetReturnHistoryEntity, dataSource.createEntityManager());
    }
}
