import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailAccountsEntity } from '../../entities/email-accounts.entity';
import { GlobalResponse } from '@adminvault/backend-utils';
import {
    CreateEmailAccountModel,
    DeleteEmailAccountModel,
    GetAllEmailAccountsModel,
    EmailAccountResponseModel
} from '@adminvault/shared-models';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class EmailAccountsService {
    constructor(
        @InjectRepository(EmailAccountsEntity)
        private readonly repo: Repository<EmailAccountsEntity>,
        private auditLogsService: AuditLogsService
    ) { }

    /**
     * Retrieve all email accounts
     * Fetches complete list of email account configurations
     * 
     * @returns GetAllEmailAccountsModel with array of email account data
     */
    async findAll(): Promise<GetAllEmailAccountsModel> {
        const accounts = await this.repo.find();

        const accountResponses = accounts.map(a => new EmailAccountResponseModel(
            a.id,
            a.email,
            a.emailType,
            a.status,
            a.createdAt,
            a.updatedAt,
            a.employeeId ?? undefined
        ));

        return new GetAllEmailAccountsModel(true, 200, 'Email accounts retrieved successfully', accountResponses);
    }

    /**
     * Create a new email account configuration
     * Adds a new email account entry to the system
     * 
     * @param reqModel - Email account creation data
     * @returns GlobalResponse indicating success with 201 status code
     */
    async create(reqModel: CreateEmailAccountModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const entity = this.repo.create(reqModel);
        await this.repo.save(entity);

        // AUDIT LOG
        await this.auditLogsService.create({
            action: 'CREATE_EMAIL_ACCOUNT',
            resource: 'EmailAccount',
            details: `Email Account ${reqModel.email} created`,
            status: 'SUCCESS',
            userId: userId || reqModel.employeeId || undefined, // Fallback if 0
            companyId: 0,
            ipAddress: ipAddress || '0.0.0.0'
        });

        return new GlobalResponse(true, 201, 'Email account created successfully');
    }

    /**
     * Delete an email account configuration
     * Permanently removes email account from database
     * 
     * @param reqModel - Delete request with email account ID
     * @returns GlobalResponse indicating success with 200 status code
     */
    async delete(reqModel: DeleteEmailAccountModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const existing = await this.repo.findOne({ where: { id: reqModel.id } });
        await this.repo.delete(reqModel.id);

        if (existing) {
            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'DELETE_EMAIL_ACCOUNT',
                resource: 'EmailAccount',
                details: `Email Account ${existing.email} deleted`,
                status: 'SUCCESS',
                userId: userId || existing.employeeId || undefined,
                companyId: 0,
                ipAddress: ipAddress || '0.0.0.0'
            });
        }

        return new GlobalResponse(true, 200, 'Email account deleted successfully');
    }
}
