import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { EmailInfoEntity } from './entities/email-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetAllEmailInfoModel, GetEmailInfoByIdModel, EmailInfoResponseModel, EmailStatusEnum, EmailStatsResponseModel } from '@adminvault/shared-models';

@Injectable()
export class EmailInfoService {
    constructor(private readonly dataSource: DataSource, private readonly emailInfoRepo: EmailInfoRepository) { }

    async createEmailInfo(reqModel: CreateEmailInfoModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.email) throw new ErrorResponse(400, "Email is required");
            const existingEmail = await this.emailInfoRepo.findOne({ where: { email: reqModel.email } });
            if (existingEmail) throw new ErrorResponse(400, "Email already exists");
            await transManager.startTransaction();
            const newEmailInfo = new EmailInfoEntity();
            newEmailInfo.companyId = reqModel.companyId;
            newEmailInfo.emailType = reqModel.emailType;
            newEmailInfo.department = reqModel.department;
            newEmailInfo.email = reqModel.email;
            newEmailInfo.employeeId = reqModel.employeeId;
            newEmailInfo.status = EmailStatusEnum.ACTIVE;
            await transManager.getRepository(EmailInfoEntity).save(newEmailInfo);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, "Email info created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateEmailInfo(reqModel: UpdateEmailInfoModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingEmailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingEmailInfo) throw new ErrorResponse(404, "Email info not found");
            await transManager.startTransaction();
            const updateData: Partial<EmailInfoEntity> = {
                companyId: reqModel.companyId,
                emailType: reqModel.emailType,
                department: reqModel.department,
                email: reqModel.email,
                employeeId: reqModel.employeeId
            };
            await transManager.getRepository(EmailInfoEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, "Email info updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getEmailInfo(reqModel: GetEmailInfoModel): Promise<GetEmailInfoByIdModel> {
        try {
            const emailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!emailInfo) throw new ErrorResponse(404, "Email info not found");
            const response = this.mapToResponse(emailInfo);
            return new GetEmailInfoByIdModel(true, 200, "Email info retrieved successfully", response);
        } catch (error) { throw error; }
    }

    async getAllEmailInfo(companyId?: number): Promise<GetAllEmailInfoModel> {
        try {
            const data = await this.emailInfoRepo.getEmailsWithEmployee(companyId);
            const responses = data.map(info => new EmailInfoResponseModel(info.id, info.company_id, info.email_type, info.department, info.email, info.employee_id));
            return new GetAllEmailInfoModel(true, 200, "Email info retrieved successfully", responses);
        } catch (error) { throw error; }
    }

    async getEmailStats(companyId: number): Promise<EmailStatsResponseModel> {
        try {
            const stats = await this.emailInfoRepo.getEmailStatsByCompany(companyId);
            return new EmailStatsResponseModel(true, 200, "Email stats retrieved successfully", stats);
        } catch (error) { throw error; }
    }

    async deleteEmailInfo(reqModel: DeleteEmailInfoModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existingEmailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingEmailInfo) throw new ErrorResponse(404, "Email info not found");
            await transManager.startTransaction();
            await transManager.getRepository(EmailInfoEntity).delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, "Email info deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    private mapToResponse(entity: EmailInfoEntity): EmailInfoResponseModel {
        return new EmailInfoResponseModel(entity.id, entity.companyId, entity.emailType, entity.department, entity.email, entity.employeeId);
    }
}
