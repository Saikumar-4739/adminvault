import { Column, Entity } from 'typeorm';
import { CommonBaseEntity } from './common-base.entity';
import { DeviceTypeEnum } from '@adminvault/shared-models';

@Entity('device_info')
export class DeviceInfoEntity extends CommonBaseEntity {
  @Column('enum', { name: 'device_type', enum: DeviceTypeEnum, nullable: false, comment: 'Type of device' })
  deviceType: DeviceTypeEnum;

  @Column('varchar', { name: 'device_name', length: 255, nullable: false, comment: 'Name of the device' })
  deviceName: string;

  @Column('varchar', { name: 'model', length: 255, nullable: true, comment: 'Device model' })
  model: string;

  @Column('varchar', { name: 'brand_name', length: 255, nullable: true, comment: 'Device brand name' })
  brandName: string;

  @Column('varchar', { name: 'services_tag', length: 255, nullable: true, comment: 'Device service tag' })
  servicesTag: string;

  @Column('text', { name: 'configuration', nullable: true, comment: 'Device configuration details' })
  configuration: string;
}

