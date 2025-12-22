import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('device_brands')
@Index('idx_brand_name', ['name'])
export class BrandsMasterEntity extends CommonBaseEntity {

    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true, type: 'varchar' })
    status: string;

    @Column({ nullable: true })
    logo: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    website: string;

    @Column({ nullable: true, type: 'decimal', precision: 3, scale: 2 })
    rating: number;
}
