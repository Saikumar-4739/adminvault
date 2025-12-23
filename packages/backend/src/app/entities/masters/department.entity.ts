import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';
import { CompanyInfoEntity } from '../company-info.entity';

@Entity('departments')
@Index('idx_dept_name', ['name'])
export class DepartmentsMasterEntity extends CommonBaseEntity {

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Department name' })
    name: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Department description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether department is active' })
    isActive: boolean;

    @Column('varchar', { name: 'status', length: 100, nullable: true, comment: 'Department status' })
    status: string;

    @Column('varchar', { name: 'level', length: 100, nullable: true, comment: 'Department level in hierarchy' })
    level: string;

    @Column('varchar', { name: 'code', length: 50, nullable: true, comment: 'Department code' })
    code: string;
}
