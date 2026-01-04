import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { CommentByEnum } from '@adminvault/shared-models';

@Entity('ticket_comments')
@Index('idx_comment_ticket', ['ticketId'])
@Index('idx_comment_by_id', ['commentedById'])
@Index('idx_comment_company', ['companyId'])
@Index('idx_comment_user', ['userId'])
export class TicketCommentsEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'ticket_id', nullable: false, comment: 'Reference to tickets table' })
    ticketId: number;

    @Column('text', { name: 'comment', nullable: false, comment: 'Comment text' })
    comment: string;

    @Column('enum', { name: 'comment_by', enum: CommentByEnum, nullable: false, comment: 'Who made the comment' })
    commentBy: CommentByEnum;

    @Column('bigint', { name: 'commented_by_id', nullable: false, comment: 'ID of the person who commented' })
    commentedById: number;
}
