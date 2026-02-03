import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('system_menus')
export class SystemMenuEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    key: string;

    @Column({ type: 'varchar', length: 100 })
    label: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    icon: string;

    @Column({ name: 'parent_id', type: 'bigint', nullable: true })
    parentId: number;

    @ManyToOne(() => SystemMenuEntity, (menu) => menu.children, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'parent_id' })
    parent: SystemMenuEntity;

    @OneToMany(() => SystemMenuEntity, (menu) => menu.parent)
    children: SystemMenuEntity[];

    @Column({ type: 'int', default: 0 })
    displayOrder: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
