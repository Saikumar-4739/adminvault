import { Entity, Column } from 'typeorm';
import { MasterBaseEntity } from './master-base.entity';

@Entity('locations')
export class LocationEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;
}
