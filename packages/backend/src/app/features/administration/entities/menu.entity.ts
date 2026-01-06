import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('menus')
@Index('idx_menu_code', ['code'], { unique: true })
@Index('idx_menu_parent', ['parentId'])
export class MenuEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
    id: number;

    @Column('bigint', { name: 'parent_id', nullable: true })
    parentId: number;

    @Column('varchar', { name: 'code', length: 100, unique: true })
    code: string;

    @Column('varchar', { name: 'label', length: 100 })
    label: string;

    @Column('varchar', { name: 'path', length: 255, nullable: true })
    path: string;

    @Column('varchar', { name: 'icon', length: 50, nullable: true })
    icon: string;

    @Column('int', { name: 'sort_order', default: 0 })
    sortOrder: number;

    @Column('varchar', { name: 'required_permission_code', length: 100, nullable: true })
    requiredPermissionCode: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => MenuEntity, menu => menu.children)
    @JoinColumn({ name: 'parent_id' })
    parent: MenuEntity;

    @OneToMany(() => MenuEntity, menu => menu.parent)
    children: MenuEntity[];
}
