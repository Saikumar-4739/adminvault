import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';

@Entity('slack_users')
@Index('idx_slack_user_company', ['companyId'])
@Index('idx_slack_user_email', ['email'])
@Index('idx_slack_user_slack_id', ['slackUserId'])
export class SlackUserEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'slack_user_id', length: 100, nullable: true, comment: 'Slack workspace user ID' })
    slackUserId: string;

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Full name of the user' })
    name: string;

    @Column('varchar', { name: 'email', length: 255, nullable: false, comment: 'Email address' })
    email: string;

    @Column('varchar', { name: 'display_name', length: 255, nullable: true, comment: 'Display name in Slack' })
    displayName: string;

    @Column('varchar', { name: 'role', length: 100, nullable: true, comment: 'User role/position' })
    role: string;

    @Column('varchar', { name: 'department', length: 100, nullable: true, comment: 'Department name' })
    department: string;

    @Column('varchar', { name: 'avatar', length: 500, nullable: true, comment: 'Avatar URL' })
    avatar: string;

    @Column('boolean', { name: 'is_active', default: true, nullable: false, comment: 'Whether user is active' })
    isActive: boolean;

    @Column('varchar', { name: 'phone', length: 50, nullable: true, comment: 'Phone number' })
    phone: string;

    @Column('text', { name: 'notes', nullable: true, comment: 'Additional notes' })
    notes: string;
}
