import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AssetNextAssignmentEntity } from '../entities/asset-next-assignment.entity';

@Injectable()
export class AssetNextAssignmentRepository extends Repository<AssetNextAssignmentEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetNextAssignmentEntity, dataSource.createEntityManager());
    }
}
