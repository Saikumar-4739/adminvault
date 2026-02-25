export enum WorkflowType {
    ONBOARDING = 'ONBOARDING',
    OFFBOARDING = 'OFFBOARDING'
}

export enum WorkflowStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum StepStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED'
}

export enum StepType {
    MANUAL = 'MANUAL',
    AUTOMATED = 'AUTOMATED'
}

export class WorkflowStepModel {
    id!: number;
    workflowId!: number;
    title!: string;
    description!: string;
    type!: StepType;
    status!: StepStatus;
    completedAt?: Date;
    completedByUserId?: number;
    order!: number;
    metadata?: any;

    constructor(data: Partial<WorkflowStepModel>) {
        Object.assign(this, data);
    }
}

export class OnboardingWorkflowModel {
    id!: number;
    employeeId!: number;
    employeeName?: string;
    type!: WorkflowType;
    status!: WorkflowStatus;
    startedAt!: Date;
    completedAt?: Date;
    companyId!: number;
    steps!: WorkflowStepModel[];

    constructor(data: Partial<OnboardingWorkflowModel>) {
        Object.assign(this, data);
    }
}

export class CreateWorkflowRequest {
    employeeId!: number;
    type!: WorkflowType;
    companyId!: number;

    constructor(data: Partial<CreateWorkflowRequest>) {
        Object.assign(this, data);
    }
}

export class CompleteStepRequest {
    stepId!: number;
    userId!: number;
    metadata?: any;

    constructor(data: Partial<CompleteStepRequest>) {
        Object.assign(this, data);
    }
}
