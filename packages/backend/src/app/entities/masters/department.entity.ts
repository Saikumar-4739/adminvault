import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';
import { CompanyInfoEntity } from '../company-info.entity';

@Entity('departments')
@Index('idx_dept_name', ['name'])
export class DepartmentsMasterEntity extends CommonBaseEntity {

    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;

    @Column({ nullable: true, type: 'varchar' })
    status: string;

    @Column({ nullable: true, type: 'varchar' })
    level: string;

    @Column({ nullable: true, type: 'varchar' })
    code: string;

    @ManyToOne(() => CompanyInfoEntity)
    @JoinColumn({ name: 'companyId' })
    company: CompanyInfoEntity;
}
