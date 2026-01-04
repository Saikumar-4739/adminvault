import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { MFASettingsEntity } from '../entities/mfa-settings.entity';
import { AuthUsersEntity } from '../../auth-users/entities/auth-users.entity';

@Injectable()
export class MFAService {
    private readonly mfaRepo: Repository<MFASettingsEntity>;
    private readonly userRepo: Repository<AuthUsersEntity>;

    constructor(private readonly dataSource: DataSource) {
        this.mfaRepo = this.dataSource.getRepository(MFASettingsEntity);
        this.userRepo = this.dataSource.getRepository(AuthUsersEntity);
    }

    /**
     * Generate a new TOTP secret and QR code for a user
     */
    async generateSetupData(userId: number) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'AdminVault', secret);
        const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

        // Save secret temporarily (but don't enable MFA yet)
        let mfa = await this.mfaRepo.findOne({ where: { userId } });
        if (!mfa) {
            mfa = this.mfaRepo.create({ userId });
        }

        mfa.secret = secret;
        mfa.isEnabled = false; // Must be verified first
        await this.mfaRepo.save(mfa);

        return {
            secret,
            qrCode: qrCodeDataUrl
        };
    }

    /**
     * Verify initial TOTP token to enable MFA
     */
    async verifyAndEnable(userId: number, token: string) {
        const mfa = await this.mfaRepo.findOne({ where: { userId } });
        if (!mfa || !mfa.secret) {
            throw new BadRequestException('MFA setup not initiated');
        }

        const isValid = authenticator.verify({
            token,
            secret: mfa.secret
        });

        if (!isValid) {
            throw new BadRequestException('Invalid verification token');
        }

        mfa.isEnabled = true;
        // Generate recovery codes
        const recoveryCodes = this.generateRecoveryCodes();
        mfa.recoveryCodes = JSON.stringify(recoveryCodes);

        await this.mfaRepo.save(mfa);

        return {
            success: true,
            recoveryCodes
        };
    }

    /**
     * Verify a TOTP token (used during login)
     */
    async verifyToken(userId: number, token: string): Promise<boolean> {
        const mfa = await this.mfaRepo.findOne({ where: { userId } });
        if (!mfa || !mfa.isEnabled || !mfa.secret) {
            return true; // MFA not enabled, skip verification
        }

        return authenticator.verify({
            token,
            secret: mfa.secret
        });
    }

    /**
     * Disable MFA for a user
     */
    async disable(userId: number) {
        const mfa = await this.mfaRepo.findOne({ where: { userId } });
        if (mfa) {
            mfa.isEnabled = false;
            mfa.secret = null;
            mfa.recoveryCodes = null;
            await this.mfaRepo.save(mfa);
        }
        return { success: true };
    }

    /**
     * Get MFA status for a user
     */
    async getStatus(userId: number) {
        const mfa = await this.mfaRepo.findOne({ where: { userId } });
        return {
            isEnabled: mfa?.isEnabled || false
        };
    }

    private generateRecoveryCodes(): string[] {
        const codes = [];
        for (let i = 0; i < 8; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }
        return codes;
    }
}
