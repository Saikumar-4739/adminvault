import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordVaultEntity } from '../../entities/password-vault.entity';
import * as crypto from 'crypto';

@Injectable()
export class PasswordVaultService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly secretKey: Buffer;

    constructor(
        @InjectRepository(PasswordVaultEntity)
        private readonly passwordVaultRepository: Repository<PasswordVaultEntity>,
    ) {
        // In production, use environment variable
        const secret = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
        this.secretKey = crypto.scryptSync(secret, 'salt', 32);
    }

    private encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    }

    private decrypt(encryptedText: string): string {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    async findAll(companyId: number, userId: number): Promise<PasswordVaultEntity[]> {
        return await this.passwordVaultRepository.find({
            where: { companyId, createdBy: userId },
            order: { isFavorite: 'DESC', updatedAt: 'DESC' },
        });
    }

    async findOne(id: number, userId: number): Promise<PasswordVaultEntity | null> {
        const entry = await this.passwordVaultRepository.findOne({
            where: { id, createdBy: userId },
        });

        if (entry) {
            // Update last accessed time
            await this.passwordVaultRepository.update(id, { lastAccessed: new Date() });
        }

        return entry;
    }

    async create(data: Partial<PasswordVaultEntity>, password: string): Promise<PasswordVaultEntity> {
        const encryptedPassword = this.encrypt(password);

        const entry = this.passwordVaultRepository.create({
            ...data,
            encryptedPassword,
        });

        return await this.passwordVaultRepository.save(entry);
    }

    async update(id: number, userId: number, data: Partial<PasswordVaultEntity>, password?: string): Promise<PasswordVaultEntity | null> {
        const updateData: any = { ...data };

        if (password) {
            updateData.encryptedPassword = this.encrypt(password);
        }

        await this.passwordVaultRepository.update(
            { id, createdBy: userId },
            updateData
        );

        return await this.findOne(id, userId);
    }

    async delete(id: number, userId: number): Promise<boolean> {
        const result = await this.passwordVaultRepository.delete({ id, createdBy: userId });
        return (result.affected || 0) > 0;
    }

    async getDecryptedPassword(id: number, userId: number): Promise<string> {
        const entry = await this.findOne(id, userId);
        if (!entry) {
            throw new Error('Password entry not found');
        }
        return this.decrypt(entry.encryptedPassword);
    }

    async searchByCategory(companyId: number, userId: number, category: string): Promise<PasswordVaultEntity[]> {
        return await this.passwordVaultRepository.find({
            where: { companyId, createdBy: userId, category },
            order: { updatedAt: 'DESC' },
        });
    }

    async toggleFavorite(id: number, userId: number): Promise<PasswordVaultEntity> {
        const entry = await this.findOne(id, userId);
        if (!entry) {
            throw new Error('Password entry not found');
        }

        await this.passwordVaultRepository.update(
            { id, createdBy: userId },
            { isFavorite: !entry.isFavorite }
        );

        return await this.findOne(id, userId);
    }

    async getCategories(companyId: number, userId: number): Promise<string[]> {
        const entries = await this.passwordVaultRepository
            .createQueryBuilder('vault')
            .select('DISTINCT vault.category', 'category')
            .where('vault.companyId = :companyId', { companyId })
            .andWhere('vault.createdBy = :userId', { userId })
            .andWhere('vault.category IS NOT NULL')
            .getRawMany();

        return entries.map(e => e.category);
    }
}
