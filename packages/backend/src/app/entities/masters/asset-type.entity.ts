import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('asset_types')
@Index('idx_asset_type_name', ['name'])
export class AssetTypeMasterEntity extends CommonBaseEntity {

    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true, type: 'varchar' })
    status: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    logo: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true })
    contactPerson: string;

    @Column({ nullable: true })
    contactNumber: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    address: string;
}
