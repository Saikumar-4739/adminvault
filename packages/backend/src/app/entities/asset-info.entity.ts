import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AssetStatusEnum } from '@adminvault/shared-models';

@Entity('asset_info')
export class AssetInfoEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for asset info' })
    id: number;

    @Column('bigint', { name: 'company_id', nullable: false, comment: 'Reference to company_info table' })
    companyId: number;

    @Column('bigint', { name: 'device_id', nullable: false, comment: 'Reference to device_info table' })
    deviceId: number;

    @Column('varchar', { name: 'serial_number', length: 255, nullable: false, unique: true, comment: 'Asset serial number' })
    serialNumber: string;

    @Column('date', { name: 'purchase_date', nullable: false, comment: 'Asset purchase date' })
    purchaseDate: Date;

    @Column('date', { name: 'warranty_expiry', nullable: true, comment: 'Warranty expiration date' })
    warrantyExpiry: Date;

    @Column('enum', { name: 'asset_status_enum', enum: AssetStatusEnum, default: AssetStatusEnum.AVAILABLE, nullable: false, comment: 'Current asset status' })
    assetStatusEnum: AssetStatusEnum;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Record creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Record last update timestamp' })
    updatedAt: Date;
}
