import { Entity } from 'typeorm';
import { MasterBaseEntity } from './master-base.entity';

@Entity('asset_types')
export class AssetTypeEntity extends MasterBaseEntity { }
