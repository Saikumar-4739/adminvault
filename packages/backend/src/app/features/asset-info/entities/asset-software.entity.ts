import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';
import { AssetInfoEntity } from './asset-info.entity';
import { SoftwareMasterEntity } from './software-master.entity';

@Entity('asset_software')
export class AssetSoftwareEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'asset_id' })
    assetId: number;

    @ManyToOne(() => AssetInfoEntity)
    @JoinColumn({ name: 'asset_id' })
    asset: AssetInfoEntity;

    @Column('bigint', { name: 'software_id' })
    softwareId: number;

    @ManyToOne(() => SoftwareMasterEntity)
    @JoinColumn({ name: 'software_id' })
    software: SoftwareMasterEntity;

    @Column('timestamp', { name: 'installed_at', default: () => 'CURRENT_TIMESTAMP' })
    installedAt: Date;

    @Column('timestamp', { name: 'last_patched_at', nullable: true })
    lastPatchedAt: Date;

    @Column('varchar', { name: 'status', length: 50, default: 'INSTALLED' })
    status: string;
}
