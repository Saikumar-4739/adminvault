import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../../database/master-base.entity';

@Entity('asset_types')
@Index('idx_asset_type_user', ['userId'])
@Index('uq_asset_type_code', ['code'], { unique: true })
export class AssetTypeMasterEntity extends MasterBaseEntity {

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Asset type name' })
    name: string;

    @Column('varchar', { name: 'code', length: 50, nullable: false, comment: 'Asset type code (unique per company)' })
    code: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Asset type description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether asset type is active' })
    isActive: boolean;
}
