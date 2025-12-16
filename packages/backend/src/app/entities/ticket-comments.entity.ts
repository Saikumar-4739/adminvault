import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CommentByEnum } from '@org/shared-models';

@Entity('ticket_comments')
export class TicketCommentsEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for ticket comments' })
    id: number;

    @Column('bigint', { name: 'ticket_id', nullable: false, comment: 'Reference to tickets table' })
    ticketId: number;

    @Column('text', { name: 'comment', nullable: false, comment: 'Comment text' })
    comment: string;

    @Column('enum', { name: 'comment_by', enum: CommentByEnum, nullable: false, comment: 'Who made the comment' })
    commentBy: CommentByEnum;

    @Column('bigint', { name: 'commented_by_id', nullable: false, comment: 'ID of the person who commented' })
    commentedById: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Comment creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Comment last update timestamp' })
    updatedAt: Date;
}
