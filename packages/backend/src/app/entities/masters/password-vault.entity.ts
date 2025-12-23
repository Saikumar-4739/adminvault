import { Column, Entity, Index } from 'typeorm';
import { CommonBaseEntity } from '../common-base.entity';

@Entity('password_vaults')
@Index('idx_password_vault_name', ['name'])
export class PasswordVaultMasterEntity extends CommonBaseEntity {
    @Column({ nullable: false, type: 'varchar' })
    name: string;

    @Column({ nullable: false, type: 'varchar' })
    password: string;

    @Column({ nullable: true, type: 'varchar' })
    username: string;

    @Column({ nullable: true, type: 'varchar' })
    url: string;

    @Column({ nullable: true, type: 'text' })
    notes: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ nullable: false, type: 'boolean', default: true })
    isActive: boolean;
}
