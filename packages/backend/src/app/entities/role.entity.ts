import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { CompanyInfoEntity } from './company-info.entity';

@Entity('roles')
export class RoleEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
    code: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_system_role', type: 'boolean', default: false })
    isSystemRole: boolean; // System roles cannot be deleted

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'company_id', type: 'bigint', nullable: true })
    companyId: number; // null for system-wide roles

    @ManyToOne(() => CompanyInfoEntity)
    company: CompanyInfoEntity;

    @ManyToMany(() => PermissionEntity, permission => permission.roles)
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { name: 'role_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
    })
    permissions: PermissionEntity[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
