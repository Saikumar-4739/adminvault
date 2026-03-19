import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('billing_subscriptions')
export class BillingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    planName: string;

    @Column({ type: 'float' })
    amount: number;

    @Column()
    currency: string;

    @Column()
    interval: string; // 'Monthly', 'Yearly'

    @Column()
    status: string; // 'Active', 'Past Due', 'Canceled'

    @Column({ type: 'timestamp' })
    nextBillingDate: Date;

    @Column()
    companyId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity('vendors')
export class VendorEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    contactEmail: string;

    @Column({ nullable: true })
    category: string; // 'Software', 'Hardware', 'Services'

    @Column()
    status: string; // 'Active', 'Preferred', 'Inactive'

    @Column({ nullable: true })
    website: string;

    @Column({ type: 'integer', default: 5 })
    rating: number;

    @Column()
    companyId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

@Entity('invoices')
export class InvoiceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    invoiceNumber: string;

    @Column({ type: 'float' })
    amount: number;

    @Column()
    status: string; // 'Paid', 'Pending', 'Overdue'

    @Column({ type: 'timestamp' })
    invoiceDate: Date;

    @Column()
    companyId: number;

    @CreateDateColumn()
    createdAt: Date;
}
