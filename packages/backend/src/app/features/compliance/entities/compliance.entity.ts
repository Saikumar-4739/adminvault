import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_policies')
export class PolicyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column()
    category: string; // 'Security', 'HR', 'IT', 'Legal'

    @Column()
    version: string;

    @Column()
    status: string; // 'Active', 'Draft', 'Archived'

    @Column({ nullable: true })
    documentUrl: string;

    @Column()
    companyId: number;

    @Column()
    createdBy: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity('access_reviews')
export class AccessReviewEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reviewName: string;

    @Column()
    description: string;

    @Column()
    status: string; // 'Open', 'In Progress', 'Completed', 'Overdue'

    @Column({ type: 'timestamp' })
    dueDate: Date;

    @Column({ type: 'float', default: 0 })
    completionPercent: number;

    @Column()
    reviewerId: number;

    @Column()
    companyId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
