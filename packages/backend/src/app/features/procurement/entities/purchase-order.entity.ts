import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { POStatusEnum } from '@adminvault/shared-models';

@Entity('purchase_orders')
@Index('idx_po_number', ['poNumber'])
@Index('idx_po_vendor', ['vendorId'])
export class PurchaseOrderEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'po_number', length: 50, unique: true })
    poNumber: string;

    @Column('int', { name: 'vendor_id', nullable: true })
    vendorId: number;

    @Column('int', { name: 'requester_id', nullable: true })
    requesterId: number;

    @Column('date', { name: 'order_date' })
    orderDate: Date;

    @Column('date', { name: 'expected_delivery_date', nullable: true })
    expectedDeliveryDate: Date;

    @Column('enum', { name: 'status', enum: POStatusEnum, default: POStatusEnum.DRAFT })
    status: POStatusEnum;

    @Column('decimal', { name: 'total_amount', precision: 10, scale: 2, default: 0 })
    totalAmount: number;

    @Column('text', { name: 'notes', nullable: true })
    notes: string;

    @Column('int', { name: 'time_spent_minutes', default: 0 })
    timeSpentMinutes: number;
}
