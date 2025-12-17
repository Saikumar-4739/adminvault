import { Entity, Column } from 'typeorm';
import { MasterBaseEntity } from './master-base.entity';

@Entity('vendors')
export class VendorEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    contactPerson: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    address: string;
}
