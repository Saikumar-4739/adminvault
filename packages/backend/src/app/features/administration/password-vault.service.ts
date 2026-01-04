import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PasswordVaultEntity } from './entities/password-vault.entity';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import {
    CreatePasswordVaultModel,
    UpdatePasswordVaultModel,
    GetAllPasswordVaultsResponseModel,
    PasswordVault,
    GlobalResponse
} from '@adminvault/shared-models';

@Injectable()
export class PasswordVaultService {
    private readonly encryptionAlgorithm = 'aes-256-gcm';
    private readonly vaultSecretKey: Buffer;

    constructor(
        private readonly passwordVaultRepo: PasswordVaultRepository
    ) {
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

    async findAllVaultEntries(companyId: number, userId: number): Promise<GetAllPasswordVaultsResponseModel> {
        const entries = await this.passwordVaultRepo.find({
            where: { companyId, createdBy: userId },
            order: { createdAt: 'DESC' },
        });
        const responses = entries.map(e => this.mapVaultToResponse(e));
        return new GetAllPasswordVaultsResponseModel(true, 200, 'Vault entries retrieved', responses);
    }

    async findOneVaultEntry(id: number, userId: number): Promise<PasswordVault | null> {
        const entry = await this.passwordVaultRepo.findOne({ where: { id, createdBy: userId } });
        return entry ? this.mapVaultToResponse(entry) : null;
    }

    async createVaultEntry(model: CreatePasswordVaultModel): Promise<GlobalResponse> {
        const entity = new PasswordVaultEntity();
        entity.companyId = model.companyId;
        entity.name = model.name;
        entity.username = model.username || '';
        entity.password = this.vaultEncrypt(model.password);
        entity.url = model.url || '';
        entity.category = model.description || 'General';
        entity.notes = model.notes || '';
        entity.createdBy = model.userId;
        entity.isActive = model.isActive ?? true;

        await this.passwordVaultRepo.save(entity);
        return new GlobalResponse(true, 201, 'Vault entry created');
    }

    async updateVaultEntry(model: UpdatePasswordVaultModel): Promise<GlobalResponse> {
        const entry = await this.passwordVaultRepo.findOne({ where: { id: model.id } });
        if (!entry) throw new NotFoundException('Vault entry not found');

        entry.name = model.name;
        entry.username = model.username || entry.username;
        if (model.password) entry.password = this.vaultEncrypt(model.password);
        entry.url = model.url || entry.url;
        entry.notes = model.notes || entry.notes;
        entry.isActive = model.isActive;

        await this.passwordVaultRepo.save(entry);
        return new GlobalResponse(true, 200, 'Vault entry updated');
    }

    async deleteVaultEntry(id: number, userId: number): Promise<GlobalResponse> {
        const entry = await this.passwordVaultRepo.findOne({ where: { id, createdBy: userId } });
        if (!entry) throw new NotFoundException('Vault entry not found');
        await this.passwordVaultRepo.remove(entry);
        return new GlobalResponse(true, 200, 'Vault entry deleted');
    }

    async getDecryptedVaultPassword(id: number, userId: number): Promise<string> {
        const entry = await this.passwordVaultRepo.findOne({ where: { id, createdBy: userId } });
        if (!entry) throw new NotFoundException('Vault entry not found');
        return this.vaultDecrypt(entry.password);
    }

    async searchVaultByCategory(category: string, companyId: number, userId: number): Promise<GetAllPasswordVaultsResponseModel> {
        const entries = await this.passwordVaultRepo.find({
            where: { category, companyId, createdBy: userId },
        });
        const responses = entries.map(e => this.mapVaultToResponse(e));
        return new GetAllPasswordVaultsResponseModel(true, 200, `Vault entries for category ${category} retrieved`, responses);
    }

    async toggleVaultFavorite(id: number, userId: number): Promise<GlobalResponse> {
        const entry = await this.passwordVaultRepo.findOne({ where: { id, createdBy: userId } });
        if (!entry) throw new NotFoundException('Vault entry not found');
        entry.isFavorite = !entry.isFavorite;
        await this.passwordVaultRepo.save(entry);
        return new GlobalResponse(true, 200, 'Vault favorite toggled');
    }

    async getVaultCategories(companyId: number, userId: number): Promise<string[]> {
        const entries = await this.passwordVaultRepo.find({
            where: { companyId, createdBy: userId },
            select: ['category'],
        });
        return [...new Set(entries.map(e => e.category))];
    }

    private mapVaultToResponse(entity: PasswordVaultEntity): PasswordVault {
        return {
            id: Number(entity.id),
            userId: entity.createdBy,
            companyId: entity.companyId,
            name: entity.name,
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
