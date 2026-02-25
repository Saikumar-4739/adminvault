import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OnboardingWorkflowEntity } from './entities/onboarding-workflow.entity';
import { WorkflowStepEntity } from './entities/workflow-step.entity';
import { WorkflowType, WorkflowStatus, StepStatus, StepType, OnboardingWorkflowModel, WorkflowStepModel, GlobalResponse } from '@adminvault/shared-models';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class OnboardingService {
    private readonly logger = new Logger(OnboardingService.name);

    constructor(
        @InjectRepository(OnboardingWorkflowEntity)
        private onboardingRepo: Repository<OnboardingWorkflowEntity>,
        @InjectRepository(WorkflowStepEntity)
        private stepRepo: Repository<WorkflowStepEntity>,
        private dataSource: DataSource
    ) { }

    async getActiveWorkflows(companyId: number): Promise<OnboardingWorkflowModel[]> {
        const workflows = await this.onboardingRepo.find({
            where: { companyId, status: WorkflowStatus.IN_PROGRESS },
            relations: ['steps'],
            order: { startedAt: 'DESC' }
        });
        return workflows.map(w => this.mapToModel(w));
    }

    async getEmployeeWorkflow(employeeId: number): Promise<OnboardingWorkflowModel | null> {
        const workflow = await this.onboardingRepo.findOne({
            where: { employeeId },
            relations: ['steps']
        });
        return workflow ? this.mapToModel(workflow) : null;
    }

    async initializeWorkflow(employeeId: number, companyId: number, type: WorkflowType = WorkflowType.ONBOARDING): Promise<OnboardingWorkflowEntity> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const workflow = this.onboardingRepo.create({
                employeeId,
                companyId,
                type,
                status: WorkflowStatus.IN_PROGRESS,
                startedAt: new Date()
            });
            const savedWorkflow = await queryRunner.manager.save(workflow);

            const steps = type === WorkflowType.ONBOARDING
                ? this.getOnboardingSteps(savedWorkflow.id)
                : this.getOffboardingSteps(savedWorkflow.id);

            await queryRunner.manager.save(WorkflowStepEntity, steps);
            await queryRunner.commitTransaction();
            return savedWorkflow;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async completeStep(stepId: number, userId: number): Promise<GlobalResponse> {
        const step = await this.stepRepo.findOne({ where: { id: stepId }, relations: ['workflow'] });
        if (!step) throw new ErrorResponse(404, 'Step not found');
        if (step.status === StepStatus.COMPLETED) return new GlobalResponse(true, 200, 'Step already completed');

        step.status = StepStatus.COMPLETED;
        step.completedAt = new Date();
        step.completedByUserId = userId;
        await this.stepRepo.save(step);

        // Check if all steps are completed
        const allSteps = await this.stepRepo.find({ where: { workflowId: step.workflowId } });
        if (allSteps.every(s => s.status === StepStatus.COMPLETED)) {
            const workflow = step.workflow;
            workflow.status = WorkflowStatus.COMPLETED;
            workflow.completedAt = new Date();
            await this.onboardingRepo.save(workflow);
        }

        return new GlobalResponse(true, 200, 'Step completed successfully');
    }

    private getOnboardingSteps(workflowId: number): Partial<WorkflowStepEntity>[] {
        return [
            { workflowId, title: 'Account Creation', description: 'Create AD and Email accounts', type: StepType.MANUAL, order: 1, status: StepStatus.PENDING },
            { workflowId, title: 'Hardware Assignment', description: 'Assign Laptop and Peripherals', type: StepType.MANUAL, order: 2, status: StepStatus.PENDING },
            { workflowId, title: 'Software Licenses', description: 'Assign Slack, O365, and Jira licenses', type: StepType.MANUAL, order: 3, status: StepStatus.PENDING },
            { workflowId, title: 'Security Orientation', description: 'General security and policy orientation', type: StepType.MANUAL, order: 4, status: StepStatus.PENDING },
            { workflowId, title: 'Access Groups', description: 'Add to relevant Slack channels and GitHub teams', type: StepType.MANUAL, order: 5, status: StepStatus.PENDING }
        ];
    }

    private getOffboardingSteps(workflowId: number): Partial<WorkflowStepEntity>[] {
        return [
            { workflowId, title: 'Asset Recovery', description: 'Collect laptop and other hardware', type: StepType.MANUAL, order: 1, status: StepStatus.PENDING },
            { workflowId, title: 'License Revocation', description: 'Revoke Adobe, JetBrains, and other paid licenses', type: StepType.MANUAL, order: 2, status: StepStatus.PENDING },
            { workflowId, title: 'Account Deactivation', description: 'Disable AD and Google Workspace accounts', type: StepType.MANUAL, order: 3, status: StepStatus.PENDING }
        ];
    }

    private mapToModel(entity: OnboardingWorkflowEntity): OnboardingWorkflowModel {
        return new OnboardingWorkflowModel({
            id: entity.id,
            employeeId: entity.employeeId,
            type: entity.type,
            status: entity.status,
            startedAt: entity.startedAt,
            completedAt: entity.completedAt,
            companyId: entity.companyId,
            steps: entity.steps?.map(s => new WorkflowStepModel({
                id: s.id,
                workflowId: s.workflowId,
                title: s.title,
                description: s.description,
                type: s.type,
                status: s.status,
                completedAt: s.completedAt,
                completedByUserId: s.completedByUserId,
                order: s.order,
                metadata: s.metadata
            })) || []
        });
    }
}
