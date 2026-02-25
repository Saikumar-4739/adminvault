import { Entity, Column, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { ApprovalStatusEnum, ApprovalTypeEnum } from '@adminvault/shared-models';

@Entity('approval_requests')
@Index(['referenceType', 'referenceId'])
export class ApprovalRequestEntity extends CommonBaseEntity {
    @Column('enum', { enum: ApprovalTypeEnum })
    referenceType: ApprovalTypeEnum;

    @Column('bigint')
    referenceId: number;

    @Column('enum', { enum: ApprovalStatusEnum, default: ApprovalStatusEnum.PENDING })
    status: ApprovalStatusEnum;

    @Column('bigint')
    requesterId: number;

    @Column('text', { nullable: true })
    description: string;

    @Column('bigint', { nullable: true })
    actionByUserId: number;

    @Column('timestamp', { nullable: true })
    actionAt: Date;

    @Column('text', { nullable: true })
    remarks: string;

    @Column('bigint', { nullable: true })
    assignedToEmployeeId: number;
}
