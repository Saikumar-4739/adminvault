import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../database/master-base.entity';

@Entity('locations')
@Index('idx_location_name', ['name'])
@Index('idx_location_user', ['userId'])
export class LocationsMasterEntity extends MasterBaseEntity {

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Location name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Location description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether location is active' })
    isActive: boolean;

    @Column('text', { name: 'address', nullable: true, comment: 'Location address' })
    address: string;

    @Column('varchar', { name: 'city', length: 100, nullable: true, comment: 'Location city' })
    city: string;

    @Column('varchar', { name: 'country', length: 100, nullable: true, comment: 'Location country' })
    country: string;
}
