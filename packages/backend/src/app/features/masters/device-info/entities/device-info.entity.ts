import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../../../../database/master-base.entity';
import { DeviceTypeEnum } from '@adminvault/shared-models';

@Entity('device_info')
@Index('idx_device_type', ['deviceType'])
@Index('uq_device_id_unique', ['deviceId'], { unique: true })
export class DeviceInfoEntity extends MasterBaseEntity {

  @Column('varchar', { name: 'device_id', length: 100, nullable: false, comment: 'Unique device identifier within a company' })
  deviceId: string;

  @Column('enum', { name: 'device_type', enum: DeviceTypeEnum, nullable: false, comment: 'Type of device' })
  deviceType: DeviceTypeEnum;

  @Column('varchar', { name: 'device_name', length: 255, nullable: false, comment: 'Name of the device' })
  deviceName: string;

  @Column('varchar', { name: 'model', length: 255, nullable: true, comment: 'Device model' })
  model: string;

  @Column('varchar', { name: 'brand_name', length: 255, nullable: true, comment: 'Device brand name' })
  brandName: string;

  @Column('varchar', { name: 'services_tag', length: 255, nullable: true, comment: 'Service / serial tag' })
  servicesTag: string;

  @Column('text', { name: 'configuration', nullable: true, comment: 'Device configuration details' })
  configuration: string;

  @Column('bigint', { name: 'asset_type_id', nullable: true, comment: 'Linked asset type id' })
  assetTypeId: number;

  @Column('boolean', { name: 'is_active', nullable: false, default: true, comment: 'Whether device is active' })
  isActive: boolean;
}
