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

@Injectable()
export class EmailAccountsService {
    constructor(
        @InjectRepository(EmailAccountsEntity)
        private readonly repo: Repository<EmailAccountsEntity>
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
    async create(reqModel: CreateEmailAccountModel): Promise<GlobalResponse> {
        const entity = this.repo.create(reqModel);
        await this.repo.save(entity);
        return new GlobalResponse(true, 201, 'Email account created successfully');
    }

    /**
     * Delete an email account configuration
     * Permanently removes email account from database
     * 
     * @param reqModel - Delete request with email account ID
     * @returns GlobalResponse indicating success with 200 status code
     */
    async delete(reqModel: DeleteEmailAccountModel): Promise<GlobalResponse> {
        await this.repo.delete(reqModel.id);
        return new GlobalResponse(true, 200, 'Email account deleted successfully');
    }
}
