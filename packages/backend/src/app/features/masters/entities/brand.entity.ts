import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('device_brands')
@Index('idx_brand_name', ['name'])
export class BrandsMasterEntity extends CommonBaseEntity {

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Brand name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Brand description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether brand is active' })
    isActive: boolean;

    @Column('varchar', { name: 'status', length: 100, nullable: true, comment: 'Brand status' })
    status: string;

    @Column('varchar', { name: 'logo', length: 500, nullable: true, comment: 'Brand logo URL' })
    logo: string;

    @Column('varchar', { name: 'code', length: 50, nullable: true, comment: 'Brand code' })
    code: string;

    @Column('varchar', { name: 'website', length: 500, nullable: true, comment: 'Brand website URL' })
    website: string;

    @Column('decimal', { name: 'rating', precision: 3, scale: 2, nullable: true, comment: 'Brand rating (0-5)' })
    rating: number;
}
