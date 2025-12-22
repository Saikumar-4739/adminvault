import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';

@Entity('company_info')
@Index('idx_company_name', ['companyName'])
export class CompanyInfoEntity extends CommonBaseEntity {

  @Column('varchar', { name: 'company_name', length: 255, nullable: false, comment: 'Name of the company' })
  companyName: string;

  @Column('varchar', { name: 'location', length: 255, nullable: false, comment: 'Company location' })
  location: string;

  @Column('varchar', { name: 'est_date', nullable: false, comment: 'Company establishment date' })
  estDate: string;

  @Column('varchar', { name: 'email', length: 255, nullable: true, comment: 'Company email' })
  email: string | null;

  @Column('varchar', { name: 'phone', length: 50, nullable: true, comment: 'Company phone number' })
  phone: string | null;
}
