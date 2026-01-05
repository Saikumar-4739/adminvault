import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('password_vault')
@Index('idx_vault_company', ['companyId'])
@Index('idx_vault_creator', ['createdBy'])
@Index('idx_vault_category', ['category'])
export class PasswordVaultEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', comment: 'Primary key for password vault' })
    id: number;

    @Column({ name: 'title', type: 'varchar', length: 255, comment: 'Title/name of the password entry' })
    title: string;

    @Column({ name: 'username', type: 'varchar', length: 255, nullable: true, comment: 'Username for the service' })
    username: string;

    @Column({ name: 'email', type: 'varchar', length: 255, nullable: true, comment: 'Email for the service' })
    email: string;

    @Column({ name: 'encrypted_password', type: 'text', comment: 'Encrypted password' })
    encryptedPassword: string;

    @Column({ name: 'url', type: 'varchar', length: 500, nullable: true, comment: 'URL of the service' })
    url: string;

    @Column({ name: 'category', type: 'varchar', length: 100, nullable: true, comment: 'Category (e.g., Social, Work, Banking)' })
    category: string;

    @Column({ name: 'notes', type: 'text', nullable: true, comment: 'Additional notes' })
    notes: string;

    @Column({ name: 'is_favorite', type: 'boolean', default: false, comment: 'Is this a favorite entry' })
    isFavorite: boolean;

    @Column({ name: 'is_active', type: 'boolean', default: true, comment: 'Is this entry active' })
    isActive: boolean;

    @Column({ name: 'company_id', type: 'bigint', comment: 'Company ID' })
    companyId: number;

    @Column({ name: 'created_by', type: 'bigint', comment: 'User who created this entry' })
    createdBy: number;

    @Column({ name: 'last_accessed', type: 'timestamp', nullable: true, comment: 'Last time password was accessed' })
    lastAccessed: Date;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp', comment: 'Creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', comment: 'Last update timestamp' })
    updatedAt: Date;
}
