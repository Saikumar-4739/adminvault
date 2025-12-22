import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('expense_categories')
@Index('idx_expense_cat_name', ['name'])
export class ExpenseCategoriesMasterEntity extends CommonBaseEntity {
    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true, type: 'varchar' })
    categoryType: string;

    @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
    budgetLimit: number;
}
