import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserRoleEnum } from '@adminvault/shared-models';

@Entity('role_menus')
@Index(['roleKey', 'menuKey'], { unique: true })
export class RoleMenuEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    roleKey: string;

    @Column({ type: 'varchar', length: 100 })
    menuKey: string;

    @Column({ type: 'json', nullable: true, comment: 'Granular permissions: {create: boolean, read: boolean, update: boolean, delete: boolean}' })
    permissions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
        scopes?: string[];
    };

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
