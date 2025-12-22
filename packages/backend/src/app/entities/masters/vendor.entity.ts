import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('vendors')
@Index('idx_vendor_name', ['name'])
export class VendorsMasterEntity extends CommonBaseEntity {
    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true, type: 'varchar' })
    contactPerson: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;
}
