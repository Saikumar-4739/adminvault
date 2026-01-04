import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmailInfoRepository } from '../../repository/email-info.repository';
import { EmailInfoEntity } from '../../entities/email-info.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetAllEmailInfoModel, GetEmailInfoByIdModel, EmailInfoResponseModel } from '@adminvault/shared-models';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class EmailInfoService {
    constructor(
        private dataSource: DataSource,
        private emailInfoRepo: EmailInfoRepository,
        private auditLogsService: AuditLogsService
    ) { }

    /**
     * Create a new email info record
     * Validates required fields and checks for duplicate email addresses
     * 
     * @param reqModel - Email info creation data including company ID, email type, department, and email
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if required fields are missing or email already exists
     */
    async createEmailInfo(reqModel: CreateEmailInfoModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'CREATE_EMAIL_INFO',
                resource: 'EmailInfo',
                details: `Email Info ${reqModel.email} created`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: reqModel.companyId,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Email info created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Update existing email info record
     * Modifies email information including type, department, and employee assignment
     * 
     * @param reqModel - Email info update data with ID and fields to update
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if email info ID is missing or record not found
     */
    async updateEmailInfo(reqModel: UpdateEmailInfoModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'UPDATE_EMAIL_INFO',
                resource: 'EmailInfo',
                details: `Email Info ${existingEmailInfo.email} updated`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: existingEmailInfo.companyId,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Email info updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Retrieve a specific email info record by ID
     * Fetches detailed information for a single email info entry
     * 
     * @param reqModel - Request containing email info ID
     * @returns GetEmailInfoByIdModel with email info details
     * @throws ErrorResponse if email info ID is missing or record not found
     */
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

    /**
     * Retrieve all email info records, optionally filtered by company
     * Fetches list of all email info entries or entries for a specific company
     * 
     * @param companyId - Optional company ID to filter email info records
     * @returns GetAllEmailInfoModel with list of email info records
     * @throws Error if database query fails
     */
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

    /**
     * Delete an email info record (hard delete)
     * Permanently removes email info record from database
     * 
     * @param reqModel - Request containing email info ID to delete
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if email info ID is missing or record not found
     */
    async deleteEmailInfo(reqModel: DeleteEmailInfoModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'DELETE_EMAIL_INFO',
                resource: 'EmailInfo',
                details: `Email Info ${existingEmailInfo.email} deleted`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: existingEmailInfo.companyId,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Email info deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
