import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { StepStatus, StepType } from '@adminvault/shared-models';
import { OnboardingWorkflowEntity } from './onboarding-workflow.entity';

@Entity('workflow_steps')
export class WorkflowStepEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    workflowId: number;

    @ManyToOne(() => OnboardingWorkflowEntity, (workflow) => workflow.steps)
    @JoinColumn({ name: 'workflowId' })
    workflow: OnboardingWorkflowEntity;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: StepType,
        default: StepType.MANUAL
    })
    type: StepType;

    @Column({
        type: 'enum',
        enum: StepStatus,
        default: StepStatus.PENDING
    })
    status: StepStatus;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ nullable: true })
    completedByUserId: number;

    @Column()
    order: number;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any;

    @CreateDateColumn()
    createdAt: Date;
}
