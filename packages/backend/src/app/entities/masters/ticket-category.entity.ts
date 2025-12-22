import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('ticket_categories')
@Index('idx_ticket_cat_name', ['name'])
export class TicketCategoriesMasterEntity extends CommonBaseEntity {

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'tinyint', default: 1 })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    status: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    defaultPriority: string;
}
