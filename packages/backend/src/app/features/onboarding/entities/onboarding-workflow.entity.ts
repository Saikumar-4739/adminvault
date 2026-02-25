import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { WorkflowType, WorkflowStatus } from '@adminvault/shared-models';
import { WorkflowStepEntity } from './workflow-step.entity';

@Entity('onboarding_workflows')
export class OnboardingWorkflowEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    employeeId: number;

    @Column({
        type: 'enum',
        enum: WorkflowType,
        default: WorkflowType.ONBOARDING
    })
    type: WorkflowType;

    @Column({
        type: 'enum',
        enum: WorkflowStatus,
        default: WorkflowStatus.PENDING
    })
    status: WorkflowStatus;

    @CreateDateColumn()
    startedAt: Date;

    @Column({ nullable: true })
    completedAt: Date;

    @Column()
    companyId: number;

    @OneToMany(() => WorkflowStepEntity, (step: WorkflowStepEntity) => step.workflow)
    steps: WorkflowStepEntity[];

    @UpdateDateColumn()
    updatedAt: Date;
}
