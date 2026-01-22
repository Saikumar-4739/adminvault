import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { PurchaseOrderEntity } from './purchase-order.entity';
import { AssetTypeMasterEntity } from '../../masters/asset-type/entities/asset-type.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItemEntity extends CommonBaseEntity {
    @Column('int', { name: 'purchase_order_id' })
    purchaseOrderId: number;

    @ManyToOne(() => PurchaseOrderEntity, (po) => po.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchase_order_id' })
    purchaseOrder: PurchaseOrderEntity;

    @Column('varchar', { name: 'item_name', length: 255 })
    itemName: string;

    @Column('varchar', { name: 'sku', length: 100, nullable: true })
    sku: string;

    @Column('int', { name: 'quantity', default: 1 })
    quantity: number;

    @Column('decimal', { name: 'unit_price', precision: 10, scale: 2, default: 0 })
    unitPrice: number;

    @Column('decimal', { name: 'total_price', precision: 10, scale: 2, default: 0 })
    totalPrice: number;

    @Column('int', { name: 'asset_type_id', nullable: true, comment: 'Links to Asset Type for auto-creation' })
    assetTypeId: number;

    @ManyToOne(() => AssetTypeMasterEntity, { nullable: true })
    @JoinColumn({ name: 'asset_type_id' })
    assetType: AssetTypeMasterEntity;
}
