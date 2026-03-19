import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ProtocolStatusEnum } from '@adminvault/shared-models';

@Entity('security_protocols')
export class SecurityProtocolEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: ProtocolStatusEnum,
        default: ProtocolStatusEnum.MONITORING
    })
    status: ProtocolStatusEnum;

    @Column()
    companyId: number;
}
