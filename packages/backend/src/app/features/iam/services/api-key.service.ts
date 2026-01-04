import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { APIKeyEntity } from '../entities/api-key.entity';

@Injectable()
export class APIKeyService {
    private readonly apiKeyRepo: Repository<APIKeyEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.apiKeyRepo = this.dataSource.getRepository(APIKeyEntity);
    }

    async findAll(companyId: number) {
        return this.apiKeyRepo.find({ where: { companyId } });
    }

    async create(userId: number, companyId: number, name: string) {
        const rawKey = crypto.randomBytes(32).toString('hex');
        const prefix = 'av_live_';
        const apiKey = `${prefix}${rawKey}`;

        const entity = this.apiKeyRepo.create({
            userId,
            companyId,
            name,
            apiKey: this.hashKey(apiKey), // Store hashed version
            prefix,
            isActive: true
        });

        await this.apiKeyRepo.save(entity);

        return {
            name,
            apiKey, // Return raw key only once
            message: 'Please store this key safely. It will not be shown again.'
        };
    }

    async revoke(id: number) {
        const key = await this.apiKeyRepo.findOne({ where: { id } });
        if (!key) throw new BadRequestException('API Key not found');
        key.isActive = false;
        await this.apiKeyRepo.save(key);
        return { success: true };
    }

    async validateKey(apiKey: string): Promise<APIKeyEntity | null> {
        const hashedKey = this.hashKey(apiKey);
        const entity = await this.apiKeyRepo.findOne({
            where: { apiKey: hashedKey, isActive: true }
        });

        if (entity) {
            entity.lastUsedAt = new Date();
            await this.apiKeyRepo.save(entity);
        }

        return entity;
    }

    private hashKey(key: string): string {
        return crypto.createHash('sha256').update(key).digest('hex');
    }
}
