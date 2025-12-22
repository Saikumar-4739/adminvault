import { Column, Entity } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { AssetStatusEnum } from '@adminvault/shared-models';

@Entity('asset_info')
export class AssetInfoEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'device_id', nullable: false, comment: 'Reference to device_info table' })
    deviceId: number;

    @Column('bigint', { name: 'brand_id', nullable: true, comment: 'Reference to brand master table' })
    brandId: number;

    @Column('varchar', { name: 'model', length: 255, nullable: true, comment: 'Asset model' })
    model: string;

    @Column('varchar', { name: 'serial_number', length: 255, nullable: false, unique: true, comment: 'Asset serial number / Service Tag' })
    serialNumber: string;

    @Column('text', { name: 'configuration', nullable: true, comment: 'Asset configuration details' })
    configuration: string;

    @Column('bigint', { name: 'assigned_to_employee_id', nullable: true, comment: 'Reference to employees table - current user' })
    assignedToEmployeeId: number;

    @Column('bigint', { name: 'previous_user_employee_id', nullable: true, comment: 'Reference to employees table - previous user' })
    previousUserEmployeeId: number;

    @Column('varchar', { name: 'purchase_date', nullable: true, comment: 'Asset purchase date' })
    purchaseDate: Date;

    @Column('varchar', { name: 'warranty_expiry', nullable: true, comment: 'Warranty expiration date' })
    warrantyExpiry: Date;

    @Column('enum', { name: 'asset_status_enum', enum: AssetStatusEnum, default: AssetStatusEnum.AVAILABLE, nullable: false, comment: 'Current asset status' })
    assetStatusEnum: AssetStatusEnum;

    @Column('date', { name: 'user_assigned_date', nullable: true, comment: 'Date when asset was assigned to current user' })
    userAssignedDate: Date;

    @Column('date', { name: 'last_return_date', nullable: true, comment: 'Date when asset was last returned' })
    lastReturnDate: Date;
}
