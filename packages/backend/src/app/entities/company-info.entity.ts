import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('company_info')
export class CompanyInfoEntity {

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Record creation timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Record last update timestamp' })
  updatedAt: Date;
}
