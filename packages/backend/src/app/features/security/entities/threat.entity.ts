import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ThreatGravityEnum } from '@adminvault/shared-models';

@Entity('security_threats')
export class ThreatEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;

    @Column()
    source: string;

    @Column()
    status: string;

    @Column({
        type: 'enum',
        enum: ThreatGravityEnum,
        default: ThreatGravityEnum.MEDIUM
    })
    gravity: ThreatGravityEnum;

    @Column({ nullable: true })
    time: string;

    @Column()
    companyId: number;

    @CreateDateColumn()
    createdAt: Date;
}
