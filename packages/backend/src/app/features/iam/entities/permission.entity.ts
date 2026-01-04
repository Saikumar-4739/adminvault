import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('permissions')
export class PermissionEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
    code: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string;

    @Column({ name: 'resource', type: 'varchar', length: 100 })
    resource: string;

    @Column({ name: 'action', type: 'varchar', length: 50 })
    action: string; // CREATE, READ, UPDATE, DELETE, EXECUTE

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @ManyToMany(() => RoleEntity, role => role.permissions)
    roles: RoleEntity[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
