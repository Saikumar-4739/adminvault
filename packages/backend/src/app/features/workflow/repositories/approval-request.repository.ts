import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ApprovalRequestEntity } from '../entities/approval-request.entity';

@Injectable()
export class ApprovalRequestRepository extends Repository<ApprovalRequestEntity> {
    constructor(private dataSource: DataSource) {
        super(ApprovalRequestEntity, dataSource.createEntityManager());
    }
}
