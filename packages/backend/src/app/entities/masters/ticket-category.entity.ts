import { Entity, Column } from 'typeorm';
import { MasterBaseEntity } from './master-base.entity';

@Entity('ticket_categories')
export class TicketCategoryEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    defaultPriority: string;
}
