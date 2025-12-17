import { Entity, Column } from 'typeorm';
import { MasterBaseEntity } from './master-base.entity';

@Entity('device_brands')
export class BrandEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    website: string;
}
