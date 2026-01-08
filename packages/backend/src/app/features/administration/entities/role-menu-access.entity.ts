import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('role_menu_access')
@Index('idx_rma_role_menu', ['roleId', 'menuId'], { unique: true })
export class RoleMenuAccessEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
    id: number;

    @Column('bigint', { name: 'role_id' })
    roleId: number;

    @Column('bigint', { name: 'menu_id' })
    menuId: number;

    @Column('boolean', { name: 'can_create', default: false })
    canCreate: boolean;

    @Column('boolean', { name: 'can_read', default: true })
    canRead: boolean;

    @Column('boolean', { name: 'can_update', default: false })
    canUpdate: boolean;

    @Column('boolean', { name: 'can_delete', default: false })
    canDelete: boolean;

    @Column('boolean', { name: 'can_approve', default: false })
    canApprove: boolean;

}
