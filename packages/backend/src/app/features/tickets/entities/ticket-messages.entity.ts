import { Column, Entity, Index, ManyToOne, JoinColumn } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { TicketsEntity } from './tickets.entity';

@Entity('ticket_messages')
@Index('idx_msg_ticket', ['ticketId'])
@Index('idx_msg_sender', ['senderId'])
export class TicketMessageEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'ticket_id', nullable: false })
    ticketId: number;

    @Column('bigint', { name: 'sender_id', nullable: false })
    senderId: number;

    @Column('varchar', { name: 'sender_type', length: 20, nullable: false, comment: 'user or support' })
    senderType: string;

    @Column('text', { name: 'message', nullable: false })
    message: string;

    @ManyToOne(() => TicketsEntity)
    @JoinColumn({ name: 'ticket_id' })
    ticket: TicketsEntity;
}
