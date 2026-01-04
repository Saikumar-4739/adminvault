import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('applications')
@Index('idx_app_name', ['name'])
@Index('idx_app_company', ['companyId'])
@Index('idx_app_user', ['userId'])
export class ApplicationsMasterEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Application name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Application description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether application is active' })
    isActive: boolean;

    @Column('varchar', { name: 'owner_name', length: 255, nullable: true, comment: 'Application owner name' })
    ownerName: string;

    @Column('date', { name: 'app_release_date', nullable: true, comment: 'Application release date' })
    appReleaseDate: Date;
}
