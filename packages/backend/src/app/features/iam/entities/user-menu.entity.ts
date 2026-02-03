import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_menus')
@Index('idx_user_menu_pair', ['userId', 'menuKey'], { unique: true })
export class UserMenuEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number;

    @Column({ name: 'menu_key', type: 'varchar', length: 100 })
    menuKey: string;

    @Column({ type: 'json' })
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
