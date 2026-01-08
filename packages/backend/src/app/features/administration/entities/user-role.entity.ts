import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('user_roles')
export class UserRoleEntity {
    @PrimaryColumn('bigint', { name: 'user_id' })
    userId: number;

    @PrimaryColumn('bigint', { name: 'role_id' })
    roleId: number;
}
