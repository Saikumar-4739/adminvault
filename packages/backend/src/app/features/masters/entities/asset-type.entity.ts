import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../database/master-base.entity';

@Entity('asset_types')
@Index('idx_asset_type_name', ['name'])
@Index('idx_asset_type_code', ['code'])
@Index('idx_asset_type_user', ['userId'])
export class AssetTypeMasterEntity extends MasterBaseEntity {

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Asset type name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Asset type description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether asset type is active' })
    isActive: boolean;

    @Column('varchar', { name: 'code', length: 50, nullable: true, comment: 'Asset type code' })
    code: string;
}
