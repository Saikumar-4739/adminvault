import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MasterBaseEntity } from '../../../../database/master-base.entity';
import { VendorsMasterEntity } from '../../masters/vendor/entities/vendor.entity';
import { ContractStatusEnum } from '@adminvault/shared-models';

@Entity('contracts')
export class ContractEntity extends MasterBaseEntity {
    @Column('bigint', { name: 'vendor_id' })
    vendorId: number;

    @ManyToOne(() => VendorsMasterEntity)
    @JoinColumn({ name: 'vendor_id' })
    vendor: VendorsMasterEntity;

    @Column('varchar', { name: 'contract_number', length: 100 })
    contractNumber: string;

    @Column('timestamp', { name: 'start_date' })
    startDate: Date;

    @Column('timestamp', { name: 'end_date' })
    endDate: Date;

    @Column('decimal', { name: 'total_value', precision: 15, scale: 2 })
    totalValue: number;

    @Column('varchar', { name: 'currency', length: 10, default: 'USD' })
    currency: string;

    @Column('integer', { name: 'renewal_alert_days', default: 30 })
    renewalAlertDays: number;

    @Column('enum', { name: 'status', enum: ContractStatusEnum, default: ContractStatusEnum.ACTIVE })
    status: ContractStatusEnum;

    @Column('text', { name: 'description', nullable: true })
    description: string;

    @Column('text', { name: 'terms', nullable: true })
    terms: string;

    @Column('varchar', { name: 'document_url', length: 255, nullable: true })
    documentUrl: string;
}
