import { CommonAxiosService } from '../common-axios-service';

export interface PasswordVaultEntry {
    id: number;
    title: string;
    username?: string;
    email?: string;
    encryptedPassword: string;
    url?: string;
    category?: string;
    notes?: string;
    isFavorite: boolean;
    companyId: number;
    createdBy: number;
    lastAccessed?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePasswordVaultDto {
    title: string;
    username?: string;
    email?: string;
    password: string;
    url?: string;
    category?: string;
    notes?: string;
}

export interface UpdatePasswordVaultDto {
    title?: string;
    username?: string;
    email?: string;
    password?: string;
    url?: string;
    category?: string;
    notes?: string;
}

export class PasswordVaultService extends CommonAxiosService {
    async getAll(): Promise<{ status: boolean; message: string; data: PasswordVaultEntry[] }> {
        return this.get('/password-vault');
    }

    async getById(id: number): Promise<{ status: boolean; message: string; data: PasswordVaultEntry }> {
        return this.get(`/password-vault/${id}`);
    }

    async create(data: CreatePasswordVaultDto): Promise<{ status: boolean; message: string; data: PasswordVaultEntry }> {
        return this.post('/password-vault', data);
    }

    async update(id: number, data: UpdatePasswordVaultDto): Promise<{ status: boolean; message: string; data: PasswordVaultEntry }> {
        return this.put(`/password-vault/${id}`, data);
    }

    async delete(id: number): Promise<{ status: boolean; message: string }> {
        return this.delete(`/password-vault/${id}`);
    }

    async revealPassword(id: number): Promise<{ status: boolean; message: string; data: { password: string } }> {
        return this.post(`/password-vault/${id}/reveal`, {});
    }

    async toggleFavorite(id: number): Promise<{ status: boolean; message: string; data: PasswordVaultEntry }> {
        return this.post(`/password-vault/${id}/favorite`, {});
    }

    async getCategories(): Promise<{ status: boolean; message: string; data: string[] }> {
        return this.get('/password-vault/categories');
    }

    async getByCategory(category: string): Promise<{ status: boolean; message: string; data: PasswordVaultEntry[] }> {
        return this.get(`/password-vault/category/${category}`);
    }
}
