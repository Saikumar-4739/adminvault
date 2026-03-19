import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('device_health')
export class DeviceHealthEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    assetTag: string;

    @Column()
    deviceName: string;

    @Column()
    type: string; // Laptop, Mobile, Tablet

    @Column({ type: 'float' })
    cpuUsage: number;

    @Column({ type: 'float' })
    ramUsage: number;

    @Column({ type: 'float' })
    diskUsage: number;

    @Column()
    status: string; // 'Healthy', 'Warning', 'Critical'

    @Column()
    operatingSystem: string;

    @Column({ nullable: true })
    lastUser: string;

    @Column()
    companyId: number;

    @CreateDateColumn()
    lastSync: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
