import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmailInfoRepository } from '../../repository/email-info.repository';
import { EmailInfoEntity } from '../../entities/email-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetAllEmailInfoModel, GetEmailInfoByIdModel, EmailInfoResponseModel } from '@adminvault/shared-models';

@Injectable()
export class EmailInfoService {
    constructor(
        private dataSource: DataSource,
        private emailInfoRepo: EmailInfoRepository
    ) { }

    async createEmailInfo(reqModel: CreateEmailInfoModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.companyId) {
                throw new ErrorResponse(0, "Company ID is required");
            }
            if (!reqModel.emailType) {
                throw new ErrorResponse(0, "Email type is required");
            }
            if (!reqModel.department) {
                throw new ErrorResponse(0, "Department is required");
            }
            if (!reqModel.email) {
                throw new ErrorResponse(0, "Email is required");
            }

            // Check if email already exists
            const existingEmail = await this.emailInfoRepo.findOne({ where: { email: reqModel.email } });
            if (existingEmail) {
                throw new ErrorResponse(0, "Email already exists");
            }

            await transManager.startTransaction();

            const newEmailInfo = new EmailInfoEntity();
            newEmailInfo.companyId = reqModel.companyId;
            newEmailInfo.emailType = reqModel.emailType;
            newEmailInfo.department = reqModel.department;
            newEmailInfo.email = reqModel.email;
            await transManager.getRepository(EmailInfoEntity).save(newEmailInfo);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Email info created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateEmailInfo(reqModel: UpdateEmailInfoModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Email info ID is required");
            }

            const existingEmailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingEmailInfo) {
                throw new ErrorResponse(0, "Email info not found");
            }

            await transManager.startTransaction();
            const updateData: Partial<EmailInfoEntity> = {};
            updateData.companyId = reqModel.companyId;
            updateData.emailType = reqModel.emailType;
            updateData.department = reqModel.department;
            updateData.email = reqModel.email;
            updateData.employeeId = reqModel.employeeId;
            await transManager.getRepository(EmailInfoEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Email info updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getEmailInfo(reqModel: GetEmailInfoModel): Promise<GetEmailInfoByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Email info ID is required");
            }

            const emailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!emailInfo) {
                throw new ErrorResponse(0, "Email info not found");
            }

            const emailInfoResponse = new EmailInfoResponseModel(emailInfo.id, emailInfo.companyId, emailInfo.emailType, emailInfo.department, emailInfo.email, emailInfo.employeeId);
            return new GetEmailInfoByIdModel(true, 0, "Email info retrieved successfully", emailInfoResponse);
        } catch (error) {
            throw error;
        }
    }

    async getAllEmailInfo(companyId?: number): Promise<GetAllEmailInfoModel> {
        try {
            let emailInfoList: EmailInfoEntity[];

            if (companyId) {
                emailInfoList = await this.emailInfoRepo.find({ where: { companyId } });
            } else {
                emailInfoList = await this.emailInfoRepo.find();
            }

            const emailInfoResponses = emailInfoList.map(info => new EmailInfoResponseModel(info.id, info.companyId, info.emailType, info.department, info.email, info.employeeId));
            return new GetAllEmailInfoModel(true, 0, "Email info retrieved successfully", emailInfoResponses);
        } catch (error) {
            throw error;
        }
    }

    async deleteEmailInfo(reqModel: DeleteEmailInfoModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Email info ID is required");
            }

            // Check if email info exists
            const existingEmailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.id } });
            if (!existingEmailInfo) {
                throw new ErrorResponse(0, "Email info not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(EmailInfoEntity).delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Email info deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
