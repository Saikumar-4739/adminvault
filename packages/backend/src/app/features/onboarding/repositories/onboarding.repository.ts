import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OnboardingWorkflowEntity } from '../entities/onboarding-workflow.entity';

@Injectable()
export class OnboardingRepository extends Repository<OnboardingWorkflowEntity> {
    constructor(private dataSource: DataSource) {
        super(OnboardingWorkflowEntity, dataSource.createEntityManager());
    }
}
