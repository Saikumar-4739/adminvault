
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity("ticket_categories")
export class TicketCategoryEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'bigint', nullable: true, name: 'user_id' })
    userId: number;

    @Column({ type: 'bigint', nullable: true, name: 'company_id' })
    companyId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'tinyint', default: 1 })
    isActive: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    status: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    defaultPriority: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
