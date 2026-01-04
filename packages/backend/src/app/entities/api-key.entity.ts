import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AuthUsersEntity } from './auth-users.entity';

@Entity('api_keys')
export class APIKeyEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string; // "My Production API Key"

    @Column({ name: 'api_key', type: 'varchar', length: 255, unique: true })
    apiKey: string; // Hashed or masked key

    @Column({ name: 'prefix', type: 'varchar', length: 10 })
    prefix: string; // e.g. "av_live_"

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
