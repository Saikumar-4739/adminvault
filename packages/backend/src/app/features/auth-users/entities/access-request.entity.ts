import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('access_requests')
export class AccessRequestEntity {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column('varchar', { length: 255, nullable: false })
    name: string;

    @Column('varchar', { length: 255, nullable: false })
    email: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true, })
    status: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}
