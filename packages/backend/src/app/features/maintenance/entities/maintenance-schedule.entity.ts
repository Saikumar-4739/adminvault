import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { AssetInfoEntity } from '../../asset-info/entities/asset-info.entity';
import { MaintenanceStatusEnum, MaintenanceTypeEnum } from '@adminvault/shared-models';

@Entity('maintenance_schedules')
@Index('idx_maint_date', ['scheduledDate'])
@Index('idx_maint_status', ['status'])
export class MaintenanceScheduleEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'asset_id' })
    assetId: number;

    @ManyToOne(() => AssetInfoEntity)
    @JoinColumn({ name: 'asset_id' })
    asset: AssetInfoEntity;

    @Column('enum', { name: 'maintenance_type', enum: MaintenanceTypeEnum })
    maintenanceType: MaintenanceTypeEnum;

    @Column('timestamp', { name: 'scheduled_date' })
    scheduledDate: Date;

    @Column('enum', { name: 'status', enum: MaintenanceStatusEnum, default: MaintenanceStatusEnum.SCHEDULED })
    status: MaintenanceStatusEnum;

    @Column('text', { name: 'description', nullable: true })
    description: string;

    @Column('boolean', { name: 'is_recurring', default: false })
    isRecurring: boolean;

    @Column('int', { name: 'frequency_days', nullable: true })
    frequencyDays: number;

    @Column('timestamp', { name: 'completed_at', nullable: true })
    completedAt: Date;

    @Column('int', { name: 'time_spent_minutes', default: 0 })
    timeSpentMinutes: number;
}
