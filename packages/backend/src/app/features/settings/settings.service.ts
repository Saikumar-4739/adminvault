import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity, SettingType } from '../../entities/settings.entity';

@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(SettingsEntity)
        private readonly settingsRepository: Repository<SettingsEntity>,
    ) { }

    async getUserSettings(userId: number): Promise<SettingsEntity[]> {
        return await this.settingsRepository.find({
            where: { userId, type: SettingType.USER },
        });
    }

    async getCompanySettings(companyId: number): Promise<SettingsEntity[]> {
        return await this.settingsRepository.find({
            where: { companyId, type: SettingType.COMPANY },
        });
    }

    async getSystemSettings(): Promise<SettingsEntity[]> {
        return await this.settingsRepository.find({
            where: { type: SettingType.SYSTEM },
        });
    }

    async getSetting(key: string, type: SettingType, userId?: number, companyId?: number): Promise<SettingsEntity> {
        const where: any = { key, type };

        if (type === SettingType.USER && userId) {
            where.userId = userId;
        } else if (type === SettingType.COMPANY && companyId) {
            where.companyId = companyId;
        }

        return await this.settingsRepository.findOne({ where });
    }

    async setSetting(
        key: string,
        value: any,
        type: SettingType,
        userId?: number,
        companyId?: number,
        category?: string,
        description?: string
    ): Promise<SettingsEntity> {
        const existingSetting = await this.getSetting(key, type, userId, companyId);

        const settingData = {
            key,
            value: JSON.stringify(value),
            type,
            userId,
            companyId,
            category,
            description,
        };

        if (existingSetting) {
            await this.settingsRepository.update(existingSetting.id, settingData);
            return await this.settingsRepository.findOne({ where: { id: existingSetting.id } });
        } else {
            const setting = this.settingsRepository.create(settingData);
            return await this.settingsRepository.save(setting);
        }
    }

    async deleteSetting(key: string, type: SettingType, userId?: number, companyId?: number): Promise<boolean> {
        const setting = await this.getSetting(key, type, userId, companyId);
        if (setting) {
            await this.settingsRepository.delete(setting.id);
            return true;
        }
        return false;
    }

    async getAllSettingsByCategory(category: string, type: SettingType, userId?: number, companyId?: number): Promise<SettingsEntity[]> {
        const where: any = { category, type };

        if (type === SettingType.USER && userId) {
            where.userId = userId;
        } else if (type === SettingType.COMPANY && companyId) {
            where.companyId = companyId;
        }

        return await this.settingsRepository.find({ where });
    }

    async bulkSetSettings(settings: Array<{ key: string; value: any; category?: string }>, type: SettingType, userId?: number, companyId?: number): Promise<SettingsEntity[]> {
        const results: SettingsEntity[] = [];

        for (const setting of settings) {
            const result = await this.setSetting(
                setting.key,
                setting.value,
                type,
                userId,
                companyId,
                setting.category
            );
            results.push(result);
        }

        return results;
    }
}
