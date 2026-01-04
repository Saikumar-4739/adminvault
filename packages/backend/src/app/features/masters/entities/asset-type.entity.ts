import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('asset_types')
@Index('idx_asset_type_name', ['name'])
@Index('idx_asset_type_code', ['code'])
@Index('idx_asset_type_company', ['companyId'])
@Index('idx_asset_type_user', ['userId'])
export class AssetTypeMasterEntity extends CommonBaseEntity {

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Asset type name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Asset type description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether asset type is active' })
    isActive: boolean;

    @Column('varchar', { name: 'status', length: 100, nullable: true, comment: 'Asset type status' })
    status: string;

    @Column('varchar', { name: 'code', length: 50, nullable: true, comment: 'Asset type code' })
    code: string;

    @Column('varchar', { name: 'logo', length: 500, nullable: true, comment: 'Asset type logo URL' })
    logo: string;

    @Column('varchar', { name: 'website', length: 500, nullable: true, comment: 'Asset type website URL' })
    website: string;

    @Column('varchar', { name: 'contact_person', length: 255, nullable: true, comment: 'Contact person name' })
    contactPerson: string;

    @Column('varchar', { name: 'contact_number', length: 20, nullable: true, comment: 'Contact phone number' })
    contactNumber: string;

    @Column('varchar', { name: 'email', length: 255, nullable: true, comment: 'Contact email address' })
    email: string;

    @Column('text', { name: 'address', nullable: true, comment: 'Contact address' })
    address: string;
}
