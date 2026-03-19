import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('credential_vault')
export class CredentialVaultEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    username: string;

    @Column()
    password: string; // This will be encrypted

    @Column({ nullable: true })
    url: string;

    @Column({ nullable: true })
    notes: string;

    @Column()
    category: string; // e.g., 'Server', 'Cloud', 'Social', 'App'

    @Column()
    ownerId: number;

    @Column()
    companyId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
