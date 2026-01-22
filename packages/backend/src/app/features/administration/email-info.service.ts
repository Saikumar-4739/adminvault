import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailInfoEntity } from './entities/email-info.entity';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetEmailInfoByIdModel, EmailInfoResponseModel, GetAllEmailInfoModel, EmailStatsResponseModel, EmailStatusEnum, RequestAccessModel, GlobalResponse, CompanyIdRequestModel, SendTicketCreatedEmailModel, SendPasswordResetEmailModel } from '@adminvault/shared-models';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';
import { ConfigService } from '@nestjs/config';
import { EmailInfoRepository } from './repositories/email-info.repository';

@Injectable()
export class EmailInfoService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailInfoService.name);
    constructor(
        private readonly emailInfoRepo: EmailInfoRepository,
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService
    ) {
        const emailUser = this.configService.get<string>('EMAIL_USER');
        const emailPass = this.configService.get<string>('EMAIL_PASS');

        if (!emailUser || !emailPass) {
            this.logger.warn('EMAIL_USER or EMAIL_PASS is missing in environment variables. Email sending will not work.');
        }

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass,
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

    async getAllEmailInfo(reqModel: CompanyIdRequestModel): Promise<GetAllEmailInfoModel> {
        const data = await this.emailInfoRepo.getEmailsWithEmployee(reqModel.companyId);
        const responses = data.map(info => new EmailInfoResponseModel(info.id, info.company_id, info.email_type, info.department, info.email, info.employee_id));
        return new GetAllEmailInfoModel(true, 200, "Email info retrieved successfully", responses);
    }

    async getEmailStats(reqModel: CompanyIdRequestModel): Promise<EmailStatsResponseModel> {
        const stats = await this.emailInfoRepo.getEmailStatsByCompany(reqModel.companyId);
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
    async sendTicketCreatedEmail(reqModel: SendTicketCreatedEmailModel): Promise<boolean> {
        const { ticket, recipientEmail, roleName } = reqModel;
        const mailOptions = {
            from: `"AdminVault Support" <no-reply@adminvault.com>`,
            to: recipientEmail,
            subject: `[New Ticket] ${ticket.ticketCode} - ${ticket.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Ticket Created Successfully</h2>
                    <p>Hello, <strong>${roleName}</strong></p>
                    <p>A new support ticket has been created with the following details:</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Ticket ID:</strong> ${ticket.ticketCode}</p>
                        <p><strong>Subject:</strong> ${ticket.subject}</p>
                        <p><strong>Category:</strong> ${ticket.categoryEnum}</p>
                        <p><strong>Priority:</strong> <span style="color: ${ticket.priorityEnum === 'HIGH' ? 'red' : 'inherit'}">${ticket.priorityEnum}</span></p>
                        <p><strong>Created By:</strong> ${ticket.employee ? ticket.employee.email : 'Unknown'}</p>
                    </div>
                    <p>Please login to the portal to view more details and take action.</p>
                    <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #6b7280;">This is an automated message from AdminVault. Please do not reply directly to this email.</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Ticket email sent to ${recipientEmail}: ${info.messageId}`);
            return true;
        } catch (error) {
            this.logger.error(`Error sending ticket email to ${recipientEmail}`, error);
            return false;
        }
    }

    async sendPasswordResetEmail(reqModel: SendPasswordResetEmailModel): Promise<boolean> {
        const { email, token } = reqModel;
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        const mailOptions = {
            from: `"AdminVault Security" <no-reply@adminvault.com>`,
            to: email,
            subject: `[Password Reset] Reset your AdminVault password`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4f46e5;">Password Reset Request</h2>
                    <p>We received a request to reset your password for your AdminVault account.</p>
                    <p>Click the button below to reset it. This link is valid for <strong>1 hour</strong>.</p>
                    <div style="margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
                    <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this URL into your browser:</p>
                    <p style="font-size: 12px; color: #4f46e5;">${resetLink}</p>
                </div>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Reset email sent to ${email}: ${info.messageId}`);
            return true;
        } catch (error) {
            this.logger.error(`Error sending reset email to ${email}`, error);
            return false;
        }
    }
}
