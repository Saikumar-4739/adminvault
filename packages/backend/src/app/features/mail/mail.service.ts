import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { RequestAccessModel } from '@adminvault/shared-models';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
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
