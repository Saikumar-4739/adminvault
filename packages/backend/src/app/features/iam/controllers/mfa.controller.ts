import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MFAService } from '../services/mfa.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('IAM MFA')
@Controller('iam/mfa')
@UseGuards(JwtAuthGuard)
export class MFAController {
    constructor(private readonly mfaService: MFAService) { }

    @Post('get-status')
    @ApiOperation({ summary: 'Get MFA status for user' })
    async getStatus(@Req() req: any) {
        try {
            return await this.mfaService.getStatus(req.user.id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('generate-setup')
    @ApiOperation({ summary: 'Generate MFA setup data (QR code)' })
    async setup(@Req() req: any) {
        try {
            return await this.mfaService.generateSetupData(req.user.id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('verify-enable')
    @ApiOperation({ summary: 'Verify token and enable MFA' })
    @ApiBody({ schema: { properties: { token: { type: 'string' } } } })
    async verifyEnable(@Req() req: any, @Body('token') token: string) {
        try {
            return await this.mfaService.verifyAndEnable(req.user.id, token);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('disable')
    @ApiOperation({ summary: 'Disable MFA' })
    async disable(@Req() req: any) {
        try {
            return await this.mfaService.disable(req.user.id);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
