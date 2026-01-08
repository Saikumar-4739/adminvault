import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('api_keys')
@Index('idx_apikey_user', ['userId'])
@Index('idx_apikey_company', ['companyId'])
export class APIKeyEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'api_key', type: 'varchar', length: 255, unique: true })
    apiKey: string;

    @Column({ name: 'prefix', type: 'varchar', length: 10 })
    prefix: string;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number;

    @Column({ name: 'company_id', type: 'bigint' })
    companyId: number;

    @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
    lastUsedAt: Date;

    @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
    expiresAt: Date;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
