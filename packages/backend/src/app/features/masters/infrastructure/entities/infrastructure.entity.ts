import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../../database/master-base.entity';

@Entity('infrastructure')
@Index('idx_infra_device', ['device'])
@Index('idx_infra_serial', ['serialNumber'])
export class InfrastructureMasterEntity extends MasterBaseEntity {
    @Column('varchar', { name: 'device', length: 255, nullable: false, comment: 'Device Name' })
    device: string;

    @Column('varchar', { name: 'serial_number', length: 100, nullable: false, comment: 'Serial Number' })
    serialNumber: string;

    @Column('text', { name: 'description', nullable: true, comment: 'Description' })
    description: string;

    @Column('date', { name: 'purchase_date', nullable: true, comment: 'Date of Purchase' })
    purchaseDate: Date;

    @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Active Logic' })
    isActive: boolean;
}
