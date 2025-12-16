import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { AdminRoleEnum, AdminStatusEnum } from '@adminvault/shared-models';

@Entity('it_admin')
export class ItAdminEntity extends AbstractEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint', comment: 'Primary key for IT admin' })
    id: number;

    @Column('varchar', { name: 'admin_code', length: 50, nullable: false, unique: true, comment: 'Unique admin code' })
    adminCode: string;

    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Admin full name' })
    name: string;

    @Column('varchar', { name: 'email', length: 255, nullable: false, unique: true, comment: 'Admin email address' })
    email: string;

    @Column('varchar', { name: 'ph_number', length: 20, nullable: true, comment: 'Admin phone number' })
    phNumber: string;

    @Column('enum', { name: 'role_enum', enum: AdminRoleEnum, nullable: false, comment: 'Admin role' })
    roleEnum: AdminRoleEnum;

    @Column('json', { name: 'permissions', nullable: true, comment: 'Admin permissions as JSON' })
    permissions: Record<string, any>;

    @Column('enum', { name: 'status', enum: AdminStatusEnum, default: AdminStatusEnum.ACTIVE, nullable: false, comment: 'Admin account status' })
    status: AdminStatusEnum;
}
