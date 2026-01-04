import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailInfoEntity } from './entities/email-info.entity';
import { EmailInfoRepository } from './repositories/email-info.repository';
import {
    CreateEmailInfoModel,
    UpdateEmailInfoModel,
    DeleteEmailInfoModel,
    GetEmailInfoModel,
    GetEmailInfoByIdModel,
    EmailInfoResponseModel,
    GetAllEmailInfoModel,
    EmailStatsResponseModel,
    EmailStatusEnum,
    RequestAccessModel,
    GlobalResponse
} from '@adminvault/shared-models';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class EmailInfoService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailInfoService.name);

    constructor(
        private readonly emailInfoRepo: EmailInfoRepository,
        private readonly dataSource: DataSource
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

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
        const emailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.id } });
        if (!emailInfo) throw new ErrorResponse(404, "Email info not found");
        const response = new EmailInfoResponseModel(emailInfo.id, emailInfo.companyId, emailInfo.emailType, emailInfo.department, emailInfo.email, emailInfo.employeeId);
        return new GetEmailInfoByIdModel(true, 200, "Email info retrieved successfully", response);
    }

    async getAllEmailInfo(companyId?: number): Promise<GetAllEmailInfoModel> {
        const data = await this.emailInfoRepo.getEmailsWithEmployee(companyId);
        const responses = data.map(info => new EmailInfoResponseModel(info.id, info.company_id, info.email_type, info.department, info.email, info.employee_id));
        return new GetAllEmailInfoModel(true, 200, "Email info retrieved successfully", responses);
    }

    async getEmailStats(companyId: number): Promise<EmailStatsResponseModel> {
        const stats = await this.emailInfoRepo.getEmailStatsByCompany(companyId);
        return new EmailStatsResponseModel(true, 200, "Email stats retrieved successfully", stats);
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

    async sendAccessRequestEmail(request: RequestAccessModel): Promise<boolean> {
        const adminEmail = 'inolyse@gmail.com';
        const mailOptions = {
            from: `"AdminVault System" <no-reply@adminvault.com>`,
            to: adminEmail,
            subject: `[Access Request] New Account Request from ${request.name}`,
            html: `
                <h3>New Access Request</h3>
                <p><strong>Name:</strong> ${request.name}</p>
                <p><strong>Email:</strong> ${request.email}</p>
                <p><strong>Description:</strong> ${request.description || 'N/A'}</p>
                <br/>
                <p>Please review this request in the admin panel.</p>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            this.logger.error('Error sending email', error);
            return false;
        }
    }
}
