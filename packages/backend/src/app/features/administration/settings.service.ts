import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SettingsEntity } from './entities/settings.entity';
import { SettingsRepository } from './repositories/settings.repository';
import { SettingType, CreateSettingModel, BulkSetSettingsModel, GetAllSettingsResponseModel, SettingResponseModel, GlobalResponse, GetSettingsByCategoryRequestModel, DeleteSettingRequestModel, GetSettingRequestModel, GetSettingResponseModel, CompanyIdRequestModel, UserIdNumRequestModel, UserIdRequestModel } from '@adminvault/shared-models';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';

interface ISettingRule {
    name: string;
    validate: (model: CreateSettingModel) => boolean;
    message: string;
}

@Injectable()
export class SettingsService {
    constructor(
        private readonly settingsRepo: SettingsRepository,
        private readonly dataSource: DataSource
    ) { }

    /**
     * Unified condition evaluator using loops for business rules
     */
    private evaluateBusinessRules(model: CreateSettingModel): void {
        for (const rule of this.BUSINESS_RULES) {
            if (!rule.validate(model)) {
                throw new Error(`[Business Rule Failed] ${rule.name}: ${rule.message}`);
            }
        }
    }

    /**
     * High-level logic handler using internal Maps/Records
     */
    private buildSearchCriteria(type: SettingType, targetId?: number): any {
        const criteria: any = { type };
        const field = this.SETTING_SCOPE_MAP[type];

        if (field && targetId) {
            criteria[field] = targetId;
        }

        return criteria;
    }

    async getUserSettings(reqModel: UserIdNumRequestModel): Promise<GetAllSettingsResponseModel> {
        try {
            const criteria = this.buildSearchCriteria(SettingType.USER, reqModel.id);

            const settings = await this.settingsRepo.find({ where: criteria });
            const responses = settings.map(s => this.mapSettingToResponse(s));

            return new GetAllSettingsResponseModel(true, 200, 'User settings retrieved', responses);
        } catch (error) {
            throw error;
        }
    }

    async getCompanySettings(reqModel: CompanyIdRequestModel): Promise<GetAllSettingsResponseModel> {
        try {
            const criteria = this.buildSearchCriteria(SettingType.COMPANY, reqModel.companyId);
            const settings = await this.settingsRepo.find({ where: criteria });

            const responses = settings.map(s => this.mapSettingToResponse(s));
            return new GetAllSettingsResponseModel(true, 200, 'Company settings retrieved', responses);
        } catch (error) {
            throw error;
        }
    }

    async getSystemSettings(): Promise<GetAllSettingsResponseModel> {
        try {
            const criteria = this.buildSearchCriteria(SettingType.SYSTEM);
            const settings = await this.settingsRepo.find({ where: criteria });

            const responses = settings.map(s => this.mapSettingToResponse(s));
            return new GetAllSettingsResponseModel(true, 200, 'System settings retrieved', responses);
        } catch (error) {
            throw error;
        }
    }

    async getSetting(reqModel: GetSettingRequestModel): Promise<GetSettingResponseModel> {
        try {
            const where: any = { key: reqModel.key, type: reqModel.type };
            if (reqModel.userId) where.userId = reqModel.userId;
            if (reqModel.companyId) where.companyId = reqModel.companyId;

            const setting = await this.settingsRepo.findOne({ where });
            const responseData = setting ? this.mapSettingToResponse(setting) : null;
            return new GetSettingResponseModel(true, 200, setting ? 'Setting retrieved' : 'Setting not found', responseData);
        } catch (error) {
            throw error;
        }
    }

    async setSetting(reqModel: CreateSettingModel): Promise<GlobalResponse> {
        this.evaluateBusinessRules(reqModel);
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(SettingsEntity);

            const where: any = { key: reqModel.key, type: reqModel.type };
            if (reqModel.userId) where.userId = reqModel.userId;
            if (reqModel.companyId) where.companyId = reqModel.companyId;

            let setting = await repo.findOne({ where });

            setting = new SettingsEntity();
            setting.key = reqModel.key;
            setting.type = reqModel.type;
            setting.userId = reqModel.userId;
            setting.companyId = reqModel.companyId;
            const updateProps: Record<string, any> = {
                value: JSON.stringify(reqModel.value),
                category: reqModel.category || 'General',
                description: reqModel.description || '',
                isEncrypted: reqModel.isEncrypted || false
            };

            for (const key of Object.keys(updateProps)) {
                (setting as any)[key] = updateProps[key];
            }

            await transManager.getRepository(SettingsEntity).save(setting);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Setting saved successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteSetting(reqModel: DeleteSettingRequestModel): Promise<GlobalResponse> {
        try {
            const where: any = { key: reqModel.key, type: reqModel.type };
            if (reqModel.userId) where.userId = reqModel.userId;
            if (reqModel.companyId) where.companyId = reqModel.companyId;

            const setting = await this.settingsRepo.findOne({ where });
            if (setting) {
                await this.settingsRepo.remove(setting);
                return new GlobalResponse(true, 200, 'Setting deleted');
            }
            return new GlobalResponse(false, 404, 'Setting not found');
        } catch (error) {
            throw error;
        }
    }

    async getAllSettingsByCategory(reqModel: GetSettingsByCategoryRequestModel): Promise<GetAllSettingsResponseModel> {
        try {
            const settings = await this.settingsRepo.find({
                where: { category: reqModel.category, ...(reqModel.companyId ? { companyId: reqModel.companyId } : {}) },
            });
            const responses = settings.map(s => this.mapSettingToResponse(s));
            return new GetAllSettingsResponseModel(true, 200, `Settings for category ${reqModel.category} retrieved`, responses);
        } catch (error) {
            throw error;
        }
    }

    async bulkSetSettings(reqModel: BulkSetSettingsModel): Promise<GlobalResponse> {
        // High level application: Iterate and apply rules for each via loop
        for (const setting of reqModel.settings) {
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

    private readonly SETTING_SCOPE_MAP: Record<string, string | null> = {
        [SettingType.USER]: 'userId',
        [SettingType.COMPANY]: 'companyId',
        [SettingType.SYSTEM]: null
    };

    private readonly BUSINESS_RULES: ISettingRule[] = [
        {
            name: 'KeyNotEmpty',
            validate: (m) => !!m.key && m.key.trim().length > 0,
            message: 'Setting key cannot be empty.'
        },
        {
            name: 'ScopedIdentityRequired',
            validate: (m) => {
                if (m.type === SettingType.USER) return !!m.userId;
                if (m.type === SettingType.COMPANY) return !!m.companyId;
                return true;
            },
            message: 'User ID or Company ID is required for non-system settings.'
        },
        {
            name: 'ValidSettingType',
            validate: (m) => Object.values(SettingType).includes(m.type),
            message: 'Invalid setting type provided.'
        }
    ];
}


