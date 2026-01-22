import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PasswordVaultEntity } from './entities/password-vault.entity';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { CreatePasswordVaultModel, UpdatePasswordVaultModel, GetAllPasswordVaultsResponseModel, PasswordVault, GlobalResponse, GetAllVaultEntriesModel, GetVaultEntryModel, DeleteVaultEntryModel, GetDecryptedPasswordModel, SearchVaultByCategoryModel, ToggleVaultFavoriteModel, GetVaultCategoriesModel, GetVaultEntryResponseModel, GetVaultCategoriesResponseModel, GetDecryptedPasswordResponseModel } from '@adminvault/shared-models';

@Injectable()
export class PasswordVaultService {
    private readonly encryptionAlgorithm = 'aes-256-gcm';
    private readonly vaultSecretKey: Buffer;
    constructor(private readonly passwordVaultRepo: PasswordVaultRepository) {
        const secret = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
        this.vaultSecretKey = crypto.scryptSync(secret, 'salt', 32);
    }

    private vaultEncrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.encryptionAlgorithm, this.vaultSecretKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + cipher.getAuthTag().toString('hex') + ':' + encrypted;
    }

    private vaultDecrypt(encryptedText: string): string {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];
        const decipher = crypto.createDecipheriv(this.encryptionAlgorithm, this.vaultSecretKey, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async findAllVaultEntries(reqModel: GetAllVaultEntriesModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            const entries = await this.passwordVaultRepo.find({
                where: { companyId: reqModel.companyId, createdBy: reqModel.userId },
                order: { createdAt: 'DESC' },
            });
            const responses = entries.map(e => this.mapVaultToResponse(e));
            return new GetAllPasswordVaultsResponseModel(true, 200, 'Vault entries retrieved', responses);
        } catch (error) {
            throw error;
        }
    }

    async findOneVaultEntry(reqModel: GetVaultEntryModel): Promise<GetVaultEntryResponseModel> {
        try {
            const entry = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id, createdBy: reqModel.userId } });
            const responseData = entry ? this.mapVaultToResponse(entry) : null;
            return new GetVaultEntryResponseModel(true, 200, entry ? 'Vault entry retrieved' : 'Vault entry not found', responseData);
        } catch (error) {
            throw error;
        }
    }

    async createVaultEntry(reqModel: CreatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            const entity = new PasswordVaultEntity();
            entity.companyId = reqModel.companyId;
            entity.title = reqModel.name;
            entity.username = reqModel.username || '';
            entity.encryptedPassword = this.vaultEncrypt(reqModel.password);
            entity.url = reqModel.url || '';
            entity.category = reqModel.description || 'General';
            entity.notes = reqModel.notes || '';
            entity.createdBy = reqModel.userId;
            entity.isActive = reqModel.isActive ?? true;

            await this.passwordVaultRepo.save(entity);
            return new GlobalResponse(true, 201, 'Vault entry created');
        } catch (error) {
            throw error;
        }
    }

    async updateVaultEntry(reqModel: UpdatePasswordVaultModel): Promise<GlobalResponse> {
        try {
            const entry = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id } });
            if (!entry) throw new NotFoundException('Vault entry not found');

            entry.title = reqModel.name;
            entry.username = reqModel.username || entry.username;
            if (reqModel.password) entry.encryptedPassword = this.vaultEncrypt(reqModel.password);
            entry.url = reqModel.url || entry.url;
            entry.notes = reqModel.notes || entry.notes;
            entry.isActive = reqModel.isActive;

            await this.passwordVaultRepo.save(entry);
            return new GlobalResponse(true, 200, 'Vault entry updated');
        } catch (error) {
            throw error;
        }
    }

    async deleteVaultEntry(reqModel: DeleteVaultEntryModel): Promise<GlobalResponse> {
        try {
            const entry = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id, createdBy: reqModel.userId } });
            if (!entry) throw new NotFoundException('Vault entry not found');
            await this.passwordVaultRepo.remove(entry);
            return new GlobalResponse(true, 200, 'Vault entry deleted');
        } catch (error) {
            throw error;
        }
    }

    async getDecryptedVaultPassword(reqModel: GetDecryptedPasswordModel): Promise<GetDecryptedPasswordResponseModel> {
        try {
            const entry = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id, createdBy: reqModel.userId } });
            if (!entry) throw new NotFoundException('Vault entry not found');
            const decryptedPassword = this.vaultDecrypt(entry.encryptedPassword);
            return new GetDecryptedPasswordResponseModel(true, 200, 'Password retrieved', decryptedPassword);
        } catch (error) {
            throw error;
        }
    }

    async searchVaultByCategory(reqModel: SearchVaultByCategoryModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            const entries = await this.passwordVaultRepo.find({
                where: { category: reqModel.category, companyId: reqModel.companyId, createdBy: reqModel.userId },
            });
            const responses = entries.map(e => this.mapVaultToResponse(e));
            return new GetAllPasswordVaultsResponseModel(true, 200, `Vault entries for category ${reqModel.category} retrieved`, responses);
        } catch (error) {
            throw error;
        }
    }

    async toggleVaultFavorite(reqModel: ToggleVaultFavoriteModel): Promise<GlobalResponse> {
        try {
            const entry = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id, createdBy: reqModel.userId } });
            if (!entry) throw new NotFoundException('Vault entry not found');
            entry.isFavorite = !entry.isFavorite;
            await this.passwordVaultRepo.save(entry);
            return new GlobalResponse(true, 200, 'Vault favorite toggled');
        } catch (error) {
            throw error;
        }
    }

    async getVaultCategories(reqModel: GetVaultCategoriesModel): Promise<GetVaultCategoriesResponseModel> {
        try {
            const entries = await this.passwordVaultRepo.find({
                where: { companyId: reqModel.companyId, createdBy: reqModel.userId },
                select: ['category'],
            });
            const categories = [...new Set(entries.map(e => e.category))] as string[];
            return new GetVaultCategoriesResponseModel(true, 200, 'Vault categories retrieved', categories);
        } catch (error) {
            throw error;
        }
    }

    private mapVaultToResponse(entity: PasswordVaultEntity): PasswordVault {
        return {
            id: Number(entity.id),
            userId: entity.createdBy,
            companyId: entity.companyId,
            name: entity.title,
            description: entity.category,
            isActive: entity.isActive,
            username: entity.username,
            password: '●●●●●●●●',
            url: entity.url,
            notes: entity.notes,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt
        };
    }
}
