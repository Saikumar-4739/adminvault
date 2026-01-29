import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { UserRoleEnum } from '@adminvault/shared-models';

@Entity('auth_users')
@Index('idx_auth_email', ['email'])
@Index('idx_auth_company', ['companyId'])
export class AuthUsersEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for auth users' })
  id: number;

  @Column('varchar', { name: 'full_name', length: 255, nullable: false, comment: 'Full name of the user' })
  fullName: string;

  @Column('bigint', { name: 'company_id', nullable: false, comment: 'Reference to company_info table' })
  companyId: number;

  @Column('varchar', { name: 'employee_id', length: 255, nullable: false, unique: true, comment: 'User employee id' })
  employeeId: string;

  @Column('varchar', { name: 'email', length: 255, nullable: false, unique: true, comment: 'User email address' })
  email: string;

  @Column('varchar', { name: 'ph_number', length: 20, nullable: true, comment: 'Phone number' })
  phNumber: string;

  @Column('varchar', { name: 'google_id', length: 255, nullable: true, unique: true, comment: 'Google account ID' })
  googleId: string;

  @Column('varchar', { name: 'microsoft_id', length: 255, nullable: true, unique: true, comment: 'Microsoft account ID' })
  microsoftId: string;

  @Column('text', { name: 'password_hash', nullable: false, comment: 'Hashed password' })
  passwordHash: string;

  @Column('enum', { name: 'user_role', enum: UserRoleEnum, default: UserRoleEnum.USER, nullable: false, comment: 'Legacy user role' })
  userRole: UserRoleEnum;

  @Column('boolean', { name: 'status', default: true, nullable: false, comment: 'User active status' })
  status: boolean;

  @Column('timestamp', { name: 'last_login', nullable: true, comment: 'Last login timestamp' })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Record creation timestamp' })
  createdAt: Date;

  @Column('varchar', { name: 'reset_token', length: 255, nullable: true, comment: 'Token for password reset' })
  resetToken: string;

  @Column('timestamp', { name: 'reset_token_expiry', nullable: true, comment: 'Expiry for reset token' })
  resetTokenExpiry: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Record last update timestamp' })
  updatedAt: Date;
}
