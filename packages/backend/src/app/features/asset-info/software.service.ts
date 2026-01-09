import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SoftwareMasterEntity } from './entities/software-master.entity';
import { AssetSoftwareEntity } from './entities/asset-software.entity';
import { 
    SoftwareModel, 
    AssetSoftwareModel, 
    GlobalResponse 
} from '@adminvault/shared-models';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class SoftwareService {
    constructor(
        @InjectRepository(SoftwareMasterEntity)
        private softwareRepo: Repository<SoftwareMasterEntity>,
        @InjectRepository(AssetSoftwareEntity)
        private assetSoftwareRepo: Repository<AssetSoftwareEntity>
    ) { }

    async getAllSoftware(): Promise<SoftwareModel[]> {
        const software = await this.softwareRepo.find();
        return software.map(s => new SoftwareModel(
            s.id, s.name, s.version, s.publisher, s.type, s.licenseKey
        ));
    }

    async addSoftware(model: SoftwareModel): Promise<GlobalResponse> {
        const entity = this.softwareRepo.create(model);
        await this.softwareRepo.save(entity);
        return new GlobalResponse(true, 201, "Software added to master list");
    }

    async getAssetSoftware(assetId: number): Promise<AssetSoftwareModel[]> {
        const installed = await this.assetSoftwareRepo.find({
            where: { assetId },
            relations: ['software']
        });
        
        return installed.map(i => new AssetSoftwareModel(
            Number(i.assetId), Number(i.softwareId), i.installedAt, i.status, i.software?.name, i.lastPatchedAt
        ));
    }

    async installSoftware(assetId: number, softwareId: number): Promise<GlobalResponse> {
        const exists = await this.assetSoftwareRepo.findOne({ where: { assetId, softwareId } });
        if (exists) throw new ErrorResponse(400, "Software already installed on this asset");

        const install = this.assetSoftwareRepo.create({
            assetId,
            softwareId,
            installedAt: new Date(),
            status: 'ACTIVE'
        });

        await this.assetSoftwareRepo.save(install);
        return new GlobalResponse(true, 201, "Software installation logged");
    }
}
