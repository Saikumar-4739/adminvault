import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserRoleEnum } from '@adminvault/shared-models';

@Entity('role_menus')
@Index(['role', 'menuKey'], { unique: true })
export class RoleMenuEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({
        type: 'enum',
        enum: UserRoleEnum,
        default: UserRoleEnum.USER
    })
    role: UserRoleEnum;

    @Column({ type: 'varchar', length: 100 })
    menuKey: string;

    @Column({ type: 'json', nullable: true, comment: 'Granular permissions: {create: boolean, read: boolean, update: boolean, delete: boolean}' })
    permissions: {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
    };

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
