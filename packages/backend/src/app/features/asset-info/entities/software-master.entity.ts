import {
    Column,
    Entity,
    Index
} from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { SoftwareTypeEnum } from '@adminvault/shared-models';

@Entity('software_master')
@Index('idx_sw_name', ['name'])
export class SoftwareMasterEntity extends CommonBaseEntity {
    @Column('varchar', { name: 'name', length: 255 })
    name: string;

    @Column('varchar', { name: 'version', length: 50, nullable: true })
    version: string;

    @Column('varchar', { name: 'publisher', length: 255, nullable: true })
    publisher: string;

    @Column('enum', { name: 'software_type', enum: SoftwareTypeEnum, default: SoftwareTypeEnum.APPLICATION })
    type: SoftwareTypeEnum;

    @Column('varchar', { name: 'license_key', length: 255, nullable: true })
    licenseKey: string;
}
