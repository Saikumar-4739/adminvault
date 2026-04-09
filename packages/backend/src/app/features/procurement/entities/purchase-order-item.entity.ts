import { Column, Entity } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItemEntity extends CommonBaseEntity {
    @Column('int', { name: 'purchase_order_id', nullable: true })
    purchaseOrderId: number;

    @Column('varchar', { name: 'item_name', length: 255 })
    itemName: string;

    @Column('int', { name: 'quantity', default: 1 })
    quantity: number;

    @Column('decimal', { name: 'unit_price', precision: 10, scale: 2, default: 0 })
    unitPrice: number;

    @Column('int', { name: 'asset_type_id', nullable: true, comment: 'Links to Asset Type for auto-creation' })
    assetTypeId: number;

    @Column('varchar', { name: 'asset_type_name', length: 255, nullable: true })
    assetTypeName: string;
}
