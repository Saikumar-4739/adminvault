import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('role_permissions')
@Index('idx_rp_role', ['roleId'])
@Index('idx_rp_perm', ['permissionId'])
export class RolePermissionEntity {
    @PrimaryColumn({ name: 'role_id', type: 'bigint' })
    roleId: number;

    @PrimaryColumn({ name: 'permission_id', type: 'bigint' })
    permissionId: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
