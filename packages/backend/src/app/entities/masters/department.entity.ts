import { Entity, Column } from 'typeorm';
import { MasterBaseEntity } from './master-base.entity';

@Entity('departments')
export class DepartmentEntity extends MasterBaseEntity {
    @Column({ nullable: true })
    code: string;
}
