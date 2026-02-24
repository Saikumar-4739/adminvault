import { Column, Entity } from 'typeorm';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('asset_software')
export class AssetSoftwareEntity extends CommonBaseEntity {
    @Column('bigint', { name: 'asset_id', nullable: true })
    assetId: number;

    @Column('bigint', { name: 'software_id', nullable: true })
    softwareId: number;

    @Column('timestamp', { name: 'installed_at', default: () => 'CURRENT_TIMESTAMP' })
    installedAt: Date;

    @Column('timestamp', { name: 'last_patched_at', nullable: true })
    lastPatchedAt: Date;

    @Column('varchar', { name: 'status', length: 50, default: 'INSTALLED' })
    status: string;
}
