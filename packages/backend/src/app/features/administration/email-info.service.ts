import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailInfoEntity } from './entities/email-info.entity';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetEmailInfoByIdModel, EmailInfoResponseModel, GetAllEmailInfoModel, EmailStatsResponseModel, EmailStatusEnum, RequestAccessModel, GlobalResponse, CompanyIdRequestModel, SendTicketCreatedEmailModel, SendPasswordResetEmailModel } from '@adminvault/shared-models';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse } from '@adminvault/backend-utils';
import { ConfigService } from '@nestjs/config';
import { EmailInfoRepository } from './repositories/email-info.repository';
import { AccessRequestRepository } from './repositories/access-request.repository';
import { AccessRequestEntity } from './entities/access-request.entity';

@Injectable()
export class EmailInfoService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailInfoService.name);
    constructor(
        private readonly emailInfoRepo: EmailInfoRepository,
        private readonly accessRequestRepo: AccessRequestRepository,
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
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        const mailOptions = {
            from: `"AdminVault System" <no-reply@adminvault.com>`,
            to: adminEmail,
            subject: `[Priority: Action Required] New Access Request from ${request.name}`,
            html: `
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.025em; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
                                Admin<span style="color: #3b82f6;">Vault</span>
                            </h1>
                            <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Access Management Protocol</p>
                        </div>

                        <!-- Body -->
                        <div style="padding: 40px 32px;">
                            <div style="margin-bottom: 32px;">
                                <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">New Account Request</h2>
                                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0;">
                                    A new user has submitted an access request for the AdminVault platform. Please review the applicant's details below to proceed with approval.
                                </p>
                            </div>

                            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; width: 35%;">Applicant Name</td>
                                        <td style="padding: 10px 0; color: #1e293b; font-size: 15px; font-weight: 600;">${request.name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase;">Work Email</td>
                                        <td style="padding: 10px 0; color: #3b82f6; font-size: 15px; font-weight: 600; text-decoration: none;">${request.email}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- CTA Section -->
                            <div style="text-align: center;">
                                <a href="${frontendUrl}/approvals" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                                    Review & Approve Request
                                </a>
                                <p style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
                                    This link will direct you to the Admin Approval dashboard.
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="padding: 32px; border-top: 1px solid #e2e8f0; text-align: center; background-color: #fafafa;">
                            <p style="font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.5;">
                                This is an automated security notification from your AdminVault core. 
                                <br/> 
                                If you are not authorized to manage access, please report this to your IT Security Lead.
                            </p>
                            <p style="font-size: 11px; color: #cbd5e1; margin-top: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                                © 2026 AdminVault Enterprise • Security First Infrastructure
                            </p>
                        </div>
                    </div>
                </div>
            `,
        };

        try {
            // Store request in database first
            const newRequest = new AccessRequestEntity();
            newRequest.name = request.name;
            newRequest.email = request.email;
            newRequest.description = request.description;
            // Use current transaction manager if any, but sendAccessRequestEmail is usually called standalone
            await this.accessRequestRepo.save(newRequest);

            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Access request email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            this.logger.error('Failed to process and send access request', error);
            return false;
        }
    }

    async sendTicketCreatedEmail(reqModel: SendTicketCreatedEmailModel): Promise<boolean> {
        const { ticket, recipientEmail, roleName } = reqModel;
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        const priorityColor = ticket.priorityEnum === 'HIGH' ? '#ef4444' : ticket.priorityEnum === 'MEDIUM' ? '#f59e0b' : '#10b981';

        const mailOptions = {
            from: `"AdminVault Support" <no-reply@adminvault.com>`,
            to: recipientEmail,
            subject: `[Ticket Received] ${ticket.ticketCode} - ${ticket.subject}`,
            html: `
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 32px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">AdminVault <span style="font-weight: 300; opacity: 0.8;">Support</span></h1>
                        </div>

                        <!-- Body -->
                        <div style="padding: 40px 32px;">
                            <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Support Ticket Logged</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 32px;">
                                Hello ${roleName}, your support request has been successfully recorded. Our team will review the details and provide an update shortly.
                            </p>

                            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase;">Reference</td>
                                        <td style="padding: 8px 0; color: #1e293b; font-size: 15px; font-weight: 700;">${ticket.ticketCode}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase;">Subject</td>
                                        <td style="padding: 8px 0; color: #1e293b; font-size: 15px;">${ticket.subject}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase;">Priority</td>
                                        <td style="padding: 8px 0;">
                                            <span style="background-color: ${priorityColor}10; color: ${priorityColor}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">${ticket.priorityEnum}</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div style="text-align: center;">
                                <a href="${frontendUrl}/tickets/${ticket.id}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">
                                    View Ticket Progress
                                </a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #f1f5f9; text-align: center;">
                            <p style="font-size: 12px; color: #94a3b8; margin: 0;">This is an automated notification. You can track your ticket status anytime through the support portal.</p>
                        </div>
                    </div>
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
        const resetLink = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"AdminVault Security" <no-reply@adminvault.com>`,
            to: email,
            subject: `[Security] Password Reset Request`,
            html: `
                <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
                        <!-- Header -->
                        <div style="background-color: #1e293b; padding: 32px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em;">Admin<span style="color: #3b82f6;">Vault</span></h1>
                        </div>

                        <!-- Body -->
                        <div style="padding: 40px 32px; text-align: center;">
                            <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">Reset Your Password</h2>
                            <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 32px;">
                                We received a request to reset your AdminVault password. Click the button below to choose a new one. This link expires in 60 minutes.
                            </p>

                            <a href="${resetLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 32px;">
                                Reset Password
                            </a>

                            <div style="border-top: 1px solid #f1f5f9; padding-top: 24px;">
                                <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; margin: 0;">
                                    Didn't request this? You can safely ignore this email. Your password will remain unchanged.
                                </p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #f1f5f9; text-align: center;">
                            <p style="font-size: 11px; color: #cbd5e1; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">AdminVault Security Center</p>
                        </div>
                    </div>
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

    async getAllAccessRequests(): Promise<AccessRequestEntity[]> {
        return await this.accessRequestRepo.find({ order: { createdAt: 'DESC' } });
    }
}
