import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('password_vaults')
@Index('idx_password_vault_name', ['name'])
export class PasswordVaultMasterEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'name', length: 255, nullable: false, comment: 'Password vault entry name' })
    name: string;

    @Column('varchar', { name: 'password', length: 500, nullable: false, comment: 'Encrypted password' })
    password: string;

    @Column('varchar', { name: 'username', length: 255, nullable: true, comment: 'Username for the account' })
    username: string;

    @Column('varchar', { name: 'url', length: 500, nullable: true, comment: 'URL of the service' })
    url: string;

    @Column('text', { name: 'notes', nullable: true, comment: 'Additional notes' })
    notes: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Entry description' })
    description: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether entry is active' })
    isActive: boolean;
}
