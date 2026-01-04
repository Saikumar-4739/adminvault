import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('sso_providers')
@Index('idx_sso_company', ['companyId'])
export class SSOProviderEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string; 

    @Column({ name: 'type', type: 'varchar', length: 50 })
    type: string;

    @Column({ name: 'client_id', type: 'varchar', length: 255 })
    clientId: string;

    @Column({ name: 'client_secret', type: 'varchar', length: 255 })
    clientSecret: string;

    @Column({ name: 'issuer_url', type: 'varchar', length: 255, nullable: true })
    issuerUrl: string;

    @Column({ name: 'authorization_url', type: 'varchar', length: 255, nullable: true })
    authorizationUrl: string;

    @Column({ name: 'token_url', type: 'varchar', length: 255, nullable: true })
    tokenUrl: string;

    @Column({ name: 'userinfo_url', type: 'varchar', length: 255, nullable: true })
    userInfoUrl: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'company_id', type: 'bigint' })
    companyId: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
