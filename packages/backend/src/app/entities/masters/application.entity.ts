import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('applications')
@Index('idx_app_name', ['name'])
export class ApplicationsMasterEntity extends CommonBaseEntity {
    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true, type: 'varchar' })
    ownerName: string;

    @Column({ type: 'date', nullable: true })
    appReleaseDate: Date;
}
