import { CommonAxiosService } from '../common-axios-service';

export enum SettingType {
    USER = 'USER',
    COMPANY = 'COMPANY',
    SYSTEM = 'SYSTEM',
}

export interface Setting {
    id: number;
    key: string;
    value: string;
    type: SettingType;
    category?: string;
    description?: string;
    companyId?: number;
    userId?: number;
    isEncrypted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface SetSettingDto {
    key: string;
    value: any;
    category?: string;
    description?: string;
}

export class SettingsService extends CommonAxiosService {
    // User Settings
    async getUserSettings(): Promise<{ status: boolean; message: string; data: Setting[] }> {
        return this.get('/settings/user');
    }

    async getUserSetting(key: string): Promise<{ status: boolean; message: string; data: Setting }> {
        return this.get(`/settings/user/${key}`);
    }

    async setUserSetting(data: SetSettingDto): Promise<{ status: boolean; message: string; data: Setting }> {
        return this.post('/settings/user', data);
    }

    async deleteUserSetting(key: string): Promise<{ status: boolean; message: string }> {
        return this.delete(`/settings/user/${key}`);
    }

    async bulkSetUserSettings(settings: Array<{ key: string; value: any; category?: string }>): Promise<{ status: boolean; message: string; data: Setting[] }> {
        return this.post('/settings/user/bulk', { settings });
    }

    // Company Settings
    async getCompanySettings(): Promise<{ status: boolean; message: string; data: Setting[] }> {
        return this.get('/settings/company');
    }

    async getCompanySetting(key: string): Promise<{ status: boolean; message: string; data: Setting }> {
        return this.get(`/settings/company/${key}`);
    }

    async setCompanySetting(data: SetSettingDto): Promise<{ status: boolean; message: string; data: Setting }> {
        return this.post('/settings/company', data);
    }

    async deleteCompanySetting(key: string): Promise<{ status: boolean; message: string }> {
        return this.delete(`/settings/company/${key}`);
    }

    async bulkSetCompanySettings(settings: Array<{ key: string; value: any; category?: string }>): Promise<{ status: boolean; message: string; data: Setting[] }> {
        return this.post('/settings/company/bulk', { settings });
    }

    // System Settings
    async getSystemSettings(): Promise<{ status: boolean; message: string; data: Setting[] }> {
        return this.get('/settings/system');
    }

    async setSystemSetting(data: SetSettingDto): Promise<{ status: boolean; message: string; data: Setting }> {
        return this.post('/settings/system', data);
    }

    // Category
    async getSettingsByCategory(category: string, type: SettingType): Promise<{ status: boolean; message: string; data: Setting[] }> {
        return this.get(`/settings/category/${category}?type=${type}`);
    }
}
