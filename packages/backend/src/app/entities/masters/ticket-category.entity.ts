import { Entity, Column } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('ticket_categories')
export class TicketCategoryEntity extends CommonBaseEntity {

    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true, type: 'varchar' })
    status: 'Active' | 'Inactive' | null;

    @Column({ nullable: true, type: 'varchar' })
    defaultPriority: 'Low' | 'Medium' | 'High' | null;
}
