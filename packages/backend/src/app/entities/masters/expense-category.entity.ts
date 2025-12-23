import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('expense_categories')
@Index('idx_expense_cat_name', ['name'])
export class ExpenseCategoriesMasterEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Expense category name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Expense category description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether expense category is active' })
    isActive: boolean;

    @Column('varchar', { name: 'category_type', length: 100, nullable: true, comment: 'Type of expense category' })
    categoryType: string;

    @Column('decimal', { name: 'budget_limit', precision: 10, scale: 2, nullable: true, comment: 'Budget limit for this category' })
    budgetLimit: number;
}
