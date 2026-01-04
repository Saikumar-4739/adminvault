import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('vendors')
@Index('idx_vendor_name', ['name'])
@Index('idx_vendor_company', ['companyId'])
@Index('idx_vendor_user', ['userId'])
export class VendorsMasterEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Vendor name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Vendor description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether vendor is active' })
    isActive: boolean;

    @Column('varchar', { name: 'contact_person', length: 255, nullable: true, comment: 'Contact person name' })
    contactPerson: string;

    @Column('varchar', { name: 'email', length: 255, nullable: true, comment: 'Vendor email address' })
    email: string;

    @Column('varchar', { name: 'phone', length: 20, nullable: true, comment: 'Vendor phone number' })
    phone: string;

    @Column('text', { name: 'address', nullable: true, comment: 'Vendor address' })
    address: string;
}
