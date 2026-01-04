import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SSOProviderEntity } from '../../../entities/sso-provider.entity';

@Injectable()
export class SSOService {
    private readonly ssoRepo: Repository<SSOProviderEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.ssoRepo = this.dataSource.getRepository(SSOProviderEntity);
    }

    async getProvidersForCompany(companyId: number) {
        return this.ssoRepo.find({ where: { companyId, isActive: true } });
    }

    async createProvider(data: Partial<SSOProviderEntity>) {
        const provider = this.ssoRepo.create(data);
        return this.ssoRepo.save(provider);
    }

    async updateProvider(id: number, data: Partial<SSOProviderEntity>) {
        const provider = await this.ssoRepo.findOne({ where: { id } });
        if (!provider) throw new BadRequestException('Provider not found');
        Object.assign(provider, data);
        return this.ssoRepo.save(provider);
    }

    async deleteProvider(id: number) {
        const provider = await this.ssoRepo.findOne({ where: { id } });
        if (!provider) throw new BadRequestException('Provider not found');
        return this.ssoRepo.remove(provider);
    }
}
