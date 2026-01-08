import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('user_permissions')
@Index('idx_up_user_perm', ['userId', 'permissionId'], { unique: true })
export class UserPermissionEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
    id: number;

    @Column('bigint', { name: 'user_id' })
    userId: number;

    @Column('bigint', { name: 'permission_id' })
    permissionId: number;

    @Column('boolean', { name: 'is_granted', default: true, comment: 'True to explicit allow, False to explicit deny' })
    isGranted: boolean;
}
