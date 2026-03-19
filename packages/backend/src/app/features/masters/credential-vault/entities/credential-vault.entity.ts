import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../../database/master-base.entity';

@Entity('credential_vault')
@Index('idx_cred_vault_app', ['appName'])
export class CredentialVaultEntity extends MasterBaseEntity {
    @Column('varchar', { name: 'app_name', length: 255, nullable: false, comment: 'App Name' })
    appName: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Description' })
    description: string;

    @Column('varchar', { name: 'password', length: 255, nullable: false, comment: 'Password' })
    password: string;

    @Column('date', { name: 'expire_date', nullable: true, comment: 'Expire Date' })
    expireDate: Date;

    @Column('varchar', { name: 'owner', length: 100, nullable: false, comment: 'Owner' })
    owner: string;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Active Logic' })
    isActive: boolean;
}
