import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PermissionEntity } from './permission.entity';

@Entity('roles')
@Index('idx_role_code', ['code'])
@Index('idx_role_company', ['companyId'])
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



    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
