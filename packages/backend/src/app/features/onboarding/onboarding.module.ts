import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingWorkflowEntity } from './entities/onboarding-workflow.entity';
import { WorkflowStepEntity } from './entities/workflow-step.entity';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingRepository } from './repositories/onboarding.repository';

@Module({
    imports: [TypeOrmModule.forFeature([OnboardingWorkflowEntity, WorkflowStepEntity])],
    controllers: [OnboardingController],
    providers: [OnboardingService, OnboardingRepository],
    exports: [OnboardingService]
})
export class OnboardingModule { }
