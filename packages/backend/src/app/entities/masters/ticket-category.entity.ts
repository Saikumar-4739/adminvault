import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('ticket_categories')
@Index('idx_ticket_cat_name', ['name'])
export class TicketCategoriesMasterEntity extends CommonBaseEntity {

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Ticket category name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Ticket category description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether ticket category is active' })
    isActive: boolean;

    @Column('varchar', { name: 'status', length: 255, nullable: true, comment: 'Ticket category status' })
    status: string;

    @Column('varchar', { name: 'default_priority', length: 255, nullable: true, comment: 'Default priority for this category' })
    defaultPriority: string;
}
