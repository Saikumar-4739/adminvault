import { Entity, Column } from 'typeorm';
import { MasterBaseEntity } from './master-base.entity';

@Entity('designations')
export class DesignationEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    level: string;
}

@Entity('asset_types')
export class AssetTypeEntity extends MasterBaseEntity { }

@Entity('device_brands')
export class BrandEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    website: string;
}

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

@Entity('locations')
export class LocationEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;
}

@Entity('ticket_categories')
export class TicketCategoryEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    defaultPriority: string;
}
