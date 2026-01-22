import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../../database/master-base.entity';

@Entity('slack_users')
@Index('idx_slack_user_email', ['email'])
@Index('idx_slack_user_slack_id', ['slackUserId'])
export class SlackUsersMasterEntity extends MasterBaseEntity {
    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'User full name' })
    name: string;

    @Column('varchar', { name: 'email', length: 255, nullable: false, comment: 'User email' })
    email: string;

    @Column('varchar', { name: 'slack_user_id', length: 50, nullable: true, comment: 'Slack User ID (e.g. U1234567)' })
    slackUserId: string;

    @Column('varchar', { name: 'display_name', length: 255, nullable: true, comment: 'Slack Display Name' })
    displayName: string;

    @Column('varchar', { name: 'role', length: 100, nullable: true, comment: 'User Role/Title' })
    role: string;

    @Column('varchar', { name: 'department', length: 100, nullable: true, comment: 'Department Name' })
    department: string;

    @Column('varchar', { name: 'phone', length: 50, nullable: true, comment: 'Phone Number' })
    phone: string;

    @Column('text', { name: 'notes', nullable: true, comment: 'Additional notes' })
    notes: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether user is active' })
    isActive: boolean;
}
