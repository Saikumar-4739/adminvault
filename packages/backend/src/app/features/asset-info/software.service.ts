import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SoftwareMasterEntity } from './entities/software-master.entity';
import { AssetSoftwareEntity } from './entities/asset-software.entity';
import { SoftwareModel, AssetSoftwareModel, GlobalResponse, GetAssetSoftwareRequestModel, InstallSoftwareRequestModel } from '@adminvault/shared-models';
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
        try {
            const software = await this.softwareRepo.find();
            return software.map(s => new SoftwareModel(
                s.id, s.name, s.version, s.publisher, s.type, s.licenseKey
            ));
        } catch (error) {
            throw error;
        }
    }

    async addSoftware(model: SoftwareModel): Promise<GlobalResponse> {
        try {
            const entity = this.softwareRepo.create(model);
            await this.softwareRepo.save(entity);
            return new GlobalResponse(true, 201, "Software added to master list");
        } catch (error) {
            throw error;
        }
    }

    async getAssetSoftware(reqModel: GetAssetSoftwareRequestModel): Promise<AssetSoftwareModel[]> {
        try {
            const assetId = reqModel.assetId;
            const installed = await this.assetSoftwareRepo.find({ where: { assetId } });

            // Fetch software info separately
            const softwareIds = [...new Set(installed.map(i => Number(i.softwareId)).filter(Boolean))];
            const softwareList = softwareIds.length > 0
                ? await this.softwareRepo.find({ where: { id: In(softwareIds) } })
                : [];
            const softwareMap = new Map<number, string>();
            softwareList.forEach(s => softwareMap.set(Number(s.id), s.name));

            return installed.map(i => new AssetSoftwareModel(
                Number(i.assetId), Number(i.softwareId), i.installedAt, i.status,
                softwareMap.get(Number(i.softwareId)),
                i.lastPatchedAt
            ));
        } catch (error) {
            throw error;
        }
    }

    async installSoftware(reqModel: InstallSoftwareRequestModel): Promise<GlobalResponse> {
        try {
            const { assetId, softwareId } = reqModel;
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
        } catch (error) {
            throw error;
        }
    }
}
