import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { UserRoleEnum } from '@org/shared-models';

@Entity('auth_users')
export class AuthUsersEntity extends AbstractEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for auth users' })
  id: number;

  @Column('varchar', { name: 'full_name', length: 255, nullable: false, comment: 'Full name of the user' })
  fullName: string;

  @Column('bigint', { name: 'company_id', nullable: false, comment: 'Reference to company_info table' })
  companyId: number;

  @Column('varchar', { name: 'email', length: 255, nullable: false, unique: true, comment: 'User email address' })
  email: string;

  @Column('varchar', { name: 'ph_number', length: 20, nullable: true, comment: 'Phone number' })
  phNumber: string;

  @Column('text', { name: 'password_hash', nullable: false, comment: 'Hashed password' })
  passwordHash: string;

  @Column('enum', { name: 'user_role', enum: UserRoleEnum, default: UserRoleEnum.USER,nullable: false, comment: 'User role in the system' })
  userRole: UserRoleEnum;

  @Column('boolean', { name: 'status', default: true, nullable: false, comment: 'User active status' })
  status: boolean;

  @Column('timestamp', { name: 'last_login', nullable: true, comment: 'Last login timestamp' })
  lastLogin: Date;
}

