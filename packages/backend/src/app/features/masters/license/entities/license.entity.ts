import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../../database/master-base.entity';

@Entity('license_masters')
@Index('idx_license_master_name', ['name'])
@Index('idx_license_master_user', ['userId'])
export class LicensesMasterEntity extends MasterBaseEntity {
    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'License name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'License description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether license is active' })
    isActive: boolean;

    @Column('date', { name: 'purchase_date', nullable: true, comment: 'License pushase date' })
    purchaseDate: Date;

    @Column('date', { name: 'expiry_date', nullable: true, comment: 'License expiry date' })
    expiryDate: Date;
}
