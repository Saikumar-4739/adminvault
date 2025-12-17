import { Entity, Column } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('locations')
export class LocationEntity extends CommonBaseEntity {

    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    country: string;
}
