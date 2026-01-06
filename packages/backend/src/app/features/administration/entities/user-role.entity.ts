import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AuthUsersEntity } from '../../auth-users/entities/auth-users.entity';
import { RoleEntity } from './role.entity';

@Entity('user_roles')
export class UserRoleEntity {
    @PrimaryColumn('bigint', { name: 'user_id' })
    userId: number;

    @PrimaryColumn('bigint', { name: 'role_id' })
    roleId: number;

    @ManyToOne(() => AuthUsersEntity)
    @JoinColumn({ name: 'user_id' })
    user: AuthUsersEntity;

    @ManyToOne(() => RoleEntity)
    @JoinColumn({ name: 'role_id' })
    role: RoleEntity;
}
