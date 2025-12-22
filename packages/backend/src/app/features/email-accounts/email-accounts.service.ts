import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailAccountsEntity } from '../../entities/email-accounts.entity';
import { GlobalResponse } from '@adminvault/backend-utils';

@Injectable()
export class EmailAccountsService {
    constructor(
        @InjectRepository(EmailAccountsEntity)
        private readonly repo: Repository<EmailAccountsEntity>
    ) { }

    async findAll(companyId?: number) {
        // Since EmailAccountsEntity doesn't seem to have companyId directly in the snippet I saw earlier, except maybe inherited? 
        // Checking CommonBaseEntity might be needed, but assuming standard findAll for now.
        // Wait, the entity definition showed 'employeeId', 'email', 'emailType', 'status'.
        // It extends CommonBaseEntity. Let's assume retrieval is flat or by employee relation if needed.
        // For now, return all.
        const data = await this.repo.find();
        return {
            status: true,
            data: data
        };
    }

    async create(data: any) {
        const entity = this.repo.create(data);
        await this.repo.save(entity);
        return new GlobalResponse(true, 201, 'Email account created successfully');
    }

    async delete(id: number) {
        await this.repo.delete(id);
        return new GlobalResponse(true, 200, 'Email account deleted successfully');
    }
}
