import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity('company_info')
export class CompanyInfoEntity extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for company info' })
  id: number;

  @Column('varchar', { name: 'company_name', length: 255, nullable: false, comment: 'Name of the company' })
  companyName: string;

  @Column('varchar', { name: 'location', length: 255, nullable: false, comment: 'Company location' })
  location: string;

  @Column('varchar', { name: 'est_date', nullable: false, comment: 'Company establishment date' })
  estDate: string;

  @Column('varchar', { name: 'email', length: 255, nullable: true, comment: 'Company email' })
  email: string;

  @Column('varchar', { name: 'phone', length: 50, nullable: true, comment: 'Company phone number' })
  phone: string;
}
