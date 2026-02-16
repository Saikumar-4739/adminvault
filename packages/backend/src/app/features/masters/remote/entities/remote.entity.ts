import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../../database/master-base.entity';

@Entity('remote_tools')
@Index('idx_remote_tool', ['remoteTool'])
export class RemoteMasterEntity extends MasterBaseEntity {
    @Column('varchar', { name: 'remote_tool', length: 255, nullable: false, comment: 'Remote Tool Name' })
    remoteTool: string;

    @Column('varchar', { name: 'username', length: 255, nullable: false, comment: 'Username' })
    username: string;

    @Column('varchar', { name: 'password', length: 255, nullable: false, comment: 'Password' })
    password: string;

    @Column('text', { name: 'notes', nullable: true, comment: 'Notes/Description' })
    notes: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Active Logic' })
    isActive: boolean;
}
