import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AccessRequestEntity } from '../entities/access-request.entity';

@Injectable()
export class AccessRequestRepository extends Repository<AccessRequestEntity> {
    constructor(private dataSource: DataSource) {
        super(AccessRequestEntity, dataSource.createEntityManager());
    }
}
