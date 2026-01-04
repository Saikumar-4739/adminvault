import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SettingsEntity } from './entities/settings.entity';
import { SettingsRepository } from './repositories/settings.repository';
import {
    SettingType,
    CreateSettingModel,
    BulkSetSettingsModel,
    GetAllSettingsResponseModel,
    SettingResponseModel,
    GlobalResponse
} from '@adminvault/shared-models';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';

@Injectable()
export class SettingsService {
    constructor(
        private readonly settingsRepo: SettingsRepository,
        private readonly dataSource: DataSource
    ) { }

    async getUserSettings(userId: number): Promise<GetAllSettingsResponseModel> {
        const settings = await this.settingsRepo.find({
            where: { userId, type: SettingType.USER },
        });
        const responses = settings.map(s => this.mapSettingToResponse(s));
        return new GetAllSettingsResponseModel(true, 200, 'User settings retrieved', responses);
    }

    async getCompanySettings(companyId: number): Promise<GetAllSettingsResponseModel> {
        const settings = await this.settingsRepo.find({
            where: { companyId, type: SettingType.COMPANY },
        });
        const responses = settings.map(s => this.mapSettingToResponse(s));
        return new GetAllSettingsResponseModel(true, 200, 'Company settings retrieved', responses);
    }

    async getSystemSettings(): Promise<GetAllSettingsResponseModel> {
        const settings = await this.settingsRepo.find({
            where: { type: SettingType.SYSTEM },
        });
        const responses = settings.map(s => this.mapSettingToResponse(s));
        return new GetAllSettingsResponseModel(true, 200, 'System settings retrieved', responses);
    }

    async getSetting(key: string, type: SettingType, userId?: number, companyId?: number): Promise<SettingResponseModel | null> {
        const where: any = { key, type };
        if (userId) where.userId = userId;
        if (companyId) where.companyId = companyId;

        const setting = await this.settingsRepo.findOne({ where });
        return setting ? this.mapSettingToResponse(setting) : null;
    }

    async setSetting(model: CreateSettingModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(SettingsEntity);

            const where: any = { key: model.key, type: model.type };
            if (model.userId) where.userId = model.userId;
            if (model.companyId) where.companyId = model.companyId;

            let setting = await repo.findOne({ where });

            if (!setting) {
                setting = new SettingsEntity();
                setting.key = model.key;
                setting.type = model.type;
                setting.userId = model.userId || null as any;
                setting.companyId = model.companyId || null as any;
            }

            setting.value = JSON.stringify(model.value);
            setting.category = model.category || 'General';
            setting.description = model.description || '';
            setting.isEncrypted = model.isEncrypted || false;

            await repo.save(setting);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Setting saved successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteSetting(key: string, type: SettingType, userId?: number, companyId?: number): Promise<GlobalResponse> {
        const where: any = { key, type };
        if (userId) where.userId = userId;
        if (companyId) where.companyId = companyId;

        const setting = await this.settingsRepo.findOne({ where });
        if (setting) {
            await this.settingsRepo.remove(setting);
            return new GlobalResponse(true, 200, 'Setting deleted');
        }
        return new GlobalResponse(false, 404, 'Setting not found');
    }

    async getAllSettingsByCategory(category: string, companyId?: number): Promise<GetAllSettingsResponseModel> {
        const settings = await this.settingsRepo.find({
            where: { category, ...(companyId ? { companyId } : {}) },
        });
        const responses = settings.map(s => this.mapSettingToResponse(s));
        return new GetAllSettingsResponseModel(true, 200, `Settings for category ${category} retrieved`, responses);
    }

    async bulkSetSettings(model: BulkSetSettingsModel): Promise<GlobalResponse> {
        for (const setting of model.settings) {
            await this.setSetting(setting);
        }
        return new GlobalResponse(true, 200, 'Bulk settings saved');
    }

    private mapSettingToResponse(entity: SettingsEntity): SettingResponseModel {
        let val = entity.value;
        try { val = JSON.parse(entity.value); } catch (e) { }
        return new SettingResponseModel(
            Number(entity.id),
            entity.key,
            val,
            entity.type,
            entity.category,
            entity.description,
            entity.userId,
            entity.companyId,
            entity.isEncrypted,
            entity.createdAt,
            entity.updatedAt
        );
    }
}
