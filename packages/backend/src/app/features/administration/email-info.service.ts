import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { EmailInfoEntity } from './entities/email-info.entity';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetEmailInfoByIdModel, EmailInfoResponseModel, GetAllEmailInfoModel, EmailStatsResponseModel, EmailStatusEnum, RequestAccessModel, GlobalResponse, IdRequestModel, SendTicketCreatedEmailModel, SendPasswordResetEmailModel, SendAssetApprovalEmailModel, SendAssetAssignedEmailModel, SendTicketStatusUpdateEmailModel } from '@adminvault/shared-models';
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
      const existingEmailInfo = await this.emailInfoRepo.findOne({ where: { id: reqModel.companyId } });
      if (!existingEmailInfo) throw new ErrorResponse(404, "Email info not found");
      await transManager.startTransaction();
      const updateData: Partial<EmailInfoEntity> = {
        companyId: reqModel.companyId,
        emailType: reqModel.emailType,
        department: reqModel.department,
        email: reqModel.email,
        employeeId: reqModel.employeeId
      };
      await transManager.getRepository(EmailInfoEntity).update(reqModel.companyId, updateData);
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

  async getAllEmailInfo(reqModel: IdRequestModel): Promise<GetAllEmailInfoModel> {
    const data = await this.emailInfoRepo.getEmailsWithEmployee(reqModel.id);
    const responses = data.map(info => new EmailInfoResponseModel(info.id, info.company_id, info.email_type, info.department, info.email, info.employee_id, info.employee_name));
    return new GetAllEmailInfoModel(true, 200, "Email info retrieved successfully", responses);
  }

  async getEmailStats(reqModel: IdRequestModel): Promise<EmailStatsResponseModel> {
    const stats = await this.emailInfoRepo.getEmailStatsByCompany(reqModel.id);
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

    const emailUser = this.configService.get<string>('EMAIL_USER');
    const mailOptions = {
      from: `"AdminVault System" <${emailUser}>`,
      to: adminEmail,
      subject: `[Priority: Action Required] New Access Request from ${request.name}`,
      html: `
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb" style="font-family:Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:20px;">
      <table width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
            <strong style="font-size:18px;color:#4f46e5;">AdminVault</strong>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:16px 20px;font-size:14px;color:#111827;">
            Hello <strong>Admin</strong>,<br><br>
            A new access request has been submitted by <strong>${request.name}</strong>.
          </td>
        </tr>

        <!-- Horizontal Info Row -->
        <tr>
          <td style="padding:12px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                
                <td width="40%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Applicant Name</div>
                  <strong style="font-size:13px;">${request.name}</strong>
                </td>

                <td width="60%" style="padding:8px;">
                  <div style="font-size:11px;color:#6b7280;">Work Email</div>
                  <strong style="font-size:13px;color:#3b82f6;">${request.email}</strong>
                </td>

              </tr>
            </table>
          </td>
        </tr>

        <!-- Button -->
        <tr>
          <td align="center" style="padding:20px;">
            <a href="${frontendUrl}/approvals"
               style="background:#4f46e5;color:#ffffff;padding:10px 18px;
                      text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;">
              Review Request
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:12px 20px;border-top:1px solid #e5e7eb;
                     font-size:11px;color:#6b7280;">
            Automated notification • Do not reply
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
            `,
    };

    try {
      // Store request in database first
      const newRequest = new AccessRequestEntity();
      newRequest.name = request.name;
      newRequest.email = request.email;
      newRequest.description = request.description;

      try {
        await this.accessRequestRepo.save(newRequest);
        this.logger.log(`Access request saved to DB for ${request.email}`);
      } catch (dbError) {
        this.logger.error('Failed to save access request to database', dbError);
        // We might still want to try sending the email even if DB save fails, 
        // but usually, if DB fails, it's a sign of a larger issue.
        // For now, let's continue to email part but log it.
      }

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Access request email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send access request email', error);
      return false;
    }
  }

  async sendTicketCreatedEmail(
    reqModel: SendTicketCreatedEmailModel
  ): Promise<boolean> {
    const { ticket, recipientEmail, roleName } = reqModel;
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const priorityColor =
      ticket.priorityEnum === 'HIGH'
        ? '#ef4444'
        : ticket.priorityEnum === 'MEDIUM'
          ? '#f59e0b'
          : '#10b981';

    const emailUser = this.configService.get<string>('EMAIL_USER');

    const mailOptions = {
      from: `"AdminVault Support" <${emailUser}>`,
      to: recipientEmail,
      subject: `[Ticket Received] ${ticket.ticketCode} - ${ticket.subject}`,
      html: `
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb"
       style="font-family:Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:20px;">

      <table width="700" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
            <strong style="font-size:18px;color:#4f46e5;">AdminVault</strong>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:16px 20px;font-size:14px;color:#111827;">
            Hello <strong>${roleName}</strong>,<br><br>
            Your ticket <strong>${ticket.ticketCode}</strong> has been created successfully.
          </td>
        </tr>

        <!-- Horizontal Row -->
        <tr>
          <td style="padding:12px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>

                <td width="25%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Ticket</div>
                  <strong style="font-size:13px;">${ticket.ticketCode}</strong>
                </td>

                <td width="20%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Status</div>
                  <strong style="font-size:13px;color:#3b82f6;">OPEN</strong>
                </td>

                <td width="20%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Priority</div>
                  <strong style="font-size:13px;color:${priorityColor};">
                    ${ticket.priorityEnum}
                  </strong>
                </td>

                <td width="35%" style="padding:8px;">
                  <div style="font-size:11px;color:#6b7280;">Subject</div>
                  <span style="font-size:13px;">
                    ${ticket.subject}
                  </span>
                </td>

              </tr>
            </table>
          </td>
        </tr>

        <!-- Button -->
        <tr>
          <td align="center" style="padding:20px;">
            <a href="${frontendUrl}/support?ticketId=${encodeURIComponent(
        ticket.id
      )}"
               style="background:#4f46e5;color:#ffffff;
                      padding:10px 18px;text-decoration:none;
                      border-radius:4px;font-size:14px;font-weight:bold;
                      display:inline-block;">
              View Ticket
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center"
              style="padding:12px 20px;border-top:1px solid #e5e7eb;
                     font-size:11px;color:#6b7280;">
            Automated notification • Do not reply
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
`,

    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Ticket creation email sent to ${recipientEmail}: ${info.messageId}`
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error sending ticket creation email to ${recipientEmail}`,
        error
      );
      return false;
    }
  }


  async sendTicketStatusUpdateEmail(reqModel: SendTicketStatusUpdateEmailModel): Promise<boolean> {
    const { ticket, recipientEmail, roleName, oldStatus, newStatus } = reqModel;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const priorityColor = ticket.priorityEnum === 'HIGH' ? '#ef4444' : ticket.priorityEnum === 'MEDIUM' ? '#f59e0b' : '#10b981';

    // Status colors
    const statusColors: any = {
      'OPEN': '#3b82f6',
      'IN_PROGRESS': '#f59e0b',
      'RESOLVED': '#10b981',
      'CLOSED': '#64748b'
    };
    const newStatusColor = statusColors[newStatus] || '#3b82f6';

    const emailUser = this.configService.get<string>('EMAIL_USER');
    const mailOptions = {
      from: `"AdminVault Support" < ${emailUser}> `,
      to: recipientEmail,
      subject: `[Ticket Update] ${ticket.ticketCode} - Status Changed to ${newStatus} `,
      html: `
<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:20px;">
      <table width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
            <strong style="font-size:18px;color:#4f46e5;">AdminVault</strong>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:16px 20px;font-size:14px;color:#111827;">
            Hello <strong>${roleName}</strong>,<br><br>
            The status of ticket <strong>${ticket.ticketCode}</strong> has been updated.
          </td>
        </tr>

        <!-- Horizontal Info Row -->
        <tr>
          <td style="padding:12px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                
                <td width="25%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Ticket</div>
                  <strong style="font-size:13px;">${ticket.ticketCode}</strong>
                </td>

                <td width="20%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Status</div>
                  <span style="font-size:13px;color:#6b7280;">${oldStatus}</span>
                  <span style="margin:0 4px;">→</span>
                  <strong style="font-size:13px;color:${newStatusColor};">${newStatus}</strong>
                </td>

                <td width="20%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Priority</div>
                  <strong style="font-size:13px;color:${priorityColor};">${ticket.priorityEnum}</strong>
                </td>

                <td width="35%" style="padding:8px;">
                  <div style="font-size:11px;color:#6b7280;">Subject</div>
                  <span style="font-size:13px;">${ticket.subject}</span>
                </td>

              </tr>
            </table>
          </td>
        </tr>

        <!-- Button -->
        <tr>
          <td align="center" style="padding:20px;">
            <a href="${frontendUrl}/support?ticketId=${encodeURIComponent(ticket.id)}"
               style="background:#4f46e5;color:#ffffff;padding:10px 18px;
                      text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;">
              Open Ticket
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:12px 20px;border-top:1px solid #e5e7eb;
                     font-size:11px;color:#6b7280;">
            Automated notification • Do not reply
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
            `,

    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Ticket status update email sent to ${recipientEmail}: ${info.messageId} `);
      return true;
    } catch (error) {
      this.logger.error(`Error sending ticket status update email to ${recipientEmail} `, error);
      return false;
    }
  }

  async sendPasswordResetEmail(reqModel: SendPasswordResetEmailModel): Promise<boolean> {
    const { email, token } = reqModel;
    const resetLink = `${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${token}`;

    const emailUser = this.configService.get<string>('EMAIL_USER');
    const mailOptions = {
      from: `"AdminVault Security" <${emailUser}>`,
      to: email,
      subject: `[Security] Password Reset Request`,
      html: `
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb" style="font-family:Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:20px;">
      <table width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
            <strong style="font-size:18px;color:#4f46e5;">AdminVault</strong>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:16px 20px;font-size:14px;color:#111827;">
            Hello,<br><br>
            We received a request to reset your AdminVault password. Click the button below to choose a new one.
          </td>
        </tr>

        <!-- Horizontal Info Row (Optional/Simplified) -->
        <tr>
            <td style="padding:12px 20px;">
                <div style="background:#f9fafb;padding:12px;border-radius:4px;font-size:13px;color:#6b7280;">
                    Note: This link expires in <strong>60 minutes</strong>. If you didn't request this, you can safely ignore this email.
                </div>
            </td>
        </tr>

        <!-- Button -->
        <tr>
          <td align="center" style="padding:20px;">
            <a href="${resetLink}"
               style="background:#4f46e5;color:#ffffff;padding:10px 18px;
                      text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;">
              Reset Password
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:12px 20px;border-top:1px solid #e5e7eb;
                     font-size:11px;color:#6b7280;">
            Automated notification • Do not reply
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
            `,
    };

    try {
      const emailUser = this.configService.get<string>('EMAIL_USER');
      const emailPass = this.configService.get<string>('EMAIL_PASS');

      if (!emailUser || !emailPass) {
        this.logger.error('Cannot send password reset email: EMAIL_USER or EMAIL_PASS environment variables are missing.');
        return false;
      }

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

  async sendAssetApprovalEmail(reqModel: SendAssetApprovalEmailModel): Promise<boolean> {
    const { approverEmail, requesterName, message, assetStats } = reqModel;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');

    this.logger.log(`Attempting to send email. User: ${emailUser ? 'Set' : 'Missing'}, Pass: ${emailPass ? 'Set' : 'Missing'}`);
    if (!emailUser || !emailPass) {
      this.logger.error('Email credentials missing');
      return false;
    }

    const mailOptions = {
      from: `"AdminVault Assets" <${emailUser}>`,
      to: approverEmail,
      subject: `[Approval Request] Asset Inventory Review - ${requesterName}`,
      html: `
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb" style="font-family:Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:20px;">
      <table width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
            <strong style="font-size:18px;color:#4f46e5;">AdminVault</strong>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:16px 20px;font-size:14px;color:#111827;">
            Hello,<br><br>
            <strong>${requesterName}</strong> has requested your approval for the current asset inventory state.
            ${message ? `<br><br><em>"${message}"</em>` : ''}
          </td>
        </tr>

        ${assetStats ? `
        <!-- Horizontal Info Row -->
        <tr>
          <td style="padding:12px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                
                <td width="25%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Total Assets</div>
                  <strong style="font-size:13px;">${assetStats.total}</strong>
                </td>

                <td width="25%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Active</div>
                  <strong style="font-size:13px;color:#10b981;">${assetStats.inUse}</strong>
                </td>

                <td width="25%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Available</div>
                  <strong style="font-size:13px;color:#3b82f6;">${assetStats.available}</strong>
                </td>

                <td width="25%" style="padding:8px;">
                  <div style="font-size:11px;color:#6b7280;">Maintenance</div>
                  <strong style="font-size:13px;color:#f59e0b;">${assetStats.maintenance}</strong>
                </td>

              </tr>
            </table>
          </td>
        </tr>
        ` : ''}

        <!-- Button -->
        <tr>
          <td align="center" style="padding:20px;">
            <a href="${frontendUrl}/assets"
               style="background:#4f46e5;color:#ffffff;padding:10px 18px;
                      text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;">
              Review Inventory
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:12px 20px;border-top:1px solid #e5e7eb;
                     font-size:11px;color:#6b7280;">
            Automated notification • Do not reply
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
            `,
    };

    try {
      this.logger.log(`Sending email to: ${approverEmail} from: ${emailUser}`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Asset approval email sent to ${approverEmail}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending asset approval email to ${approverEmail}`, error);
      if (error instanceof Error) {
        this.logger.error(`Error stack: ${error.stack}`);
      }
      return false;
    }
  }

  async sendAssetAssignedEmail(reqModel: SendAssetAssignedEmailModel): Promise<boolean> {
    const { recipientEmail, recipientName, assetName, assignedBy, assignedDate, isReassignment, remarks } = reqModel;
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPass = this.configService.get<string>('EMAIL_PASS');

    if (!emailUser || !emailPass) {
      this.logger.error('Email credentials missing for asset assignment');
      return false;
    }

    const actionText = isReassignment ? 'Reassigned' : 'Assigned';
    const subjectPrefix = isReassignment ? '[Asset Reassignment]' : '[Asset Assignment]';

    const mailOptions = {
      from: `"AdminVault Assets" <${emailUser}>`,
      to: recipientEmail,
      subject: `${subjectPrefix} ${assetName} has been ${actionText.toLowerCase()} to you`,
      html: `
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f9fafb" style="font-family:Arial,sans-serif;">
  <tr>
    <td align="center" style="padding:20px;">
      <table width="700" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;">
        
        <!-- Header -->
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
            <strong style="font-size:18px;color:#4f46e5;">AdminVault</strong>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="padding:16px 20px;font-size:14px;color:#111827;">
            Hello <strong>${recipientName}</strong>,<br><br>
            The following asset has been <strong>${actionText.toLowerCase()}</strong> to you.
            ${remarks ? `<br><br><em>Notes: "${remarks}"</em>` : ''}
          </td>
        </tr>

        <!-- Horizontal Info Row -->
        <tr>
          <td style="padding:12px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                
                <td width="40%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Asset</div>
                  <strong style="font-size:13px;">${assetName}</strong>
                </td>

                <td width="30%" style="padding:8px;border-right:1px solid #e5e7eb;">
                  <div style="font-size:11px;color:#6b7280;">Assigned By</div>
                  <strong style="font-size:13px;">${assignedBy}</strong>
                </td>

                <td width="30%" style="padding:8px;">
                  <div style="font-size:11px;color:#6b7280;">Date</div>
                  <strong style="font-size:13px;">${new Date(assignedDate).toLocaleDateString()}</strong>
                </td>

              </tr>
            </table>
          </td>
        </tr>

        <!-- Button -->
        <tr>
          <td align="center" style="padding:20px;">
            <a href="${frontendUrl}/assets/my-assets"
               style="background:#4f46e5;color:#ffffff;padding:10px 18px;
                      text-decoration:none;border-radius:4px;font-size:14px;font-weight:bold;display:inline-block;">
              View My Assets
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:12px 20px;border-top:1px solid #e5e7eb;
                     font-size:11px;color:#6b7280;">
            Automated notification • Do not reply
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
            `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Asset assignment email sent to ${recipientEmail}: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending asset assignment email to ${recipientEmail}`, error);
      if (error instanceof Error) {
        this.logger.error(`Error stack: ${error.stack}`);
      }
      return false;
    }
  }
}
