import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MFAService } from '../services/mfa.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@Controller('iam/mfa')
@UseGuards(JwtAuthGuard)
export class MFAController {
    constructor(private readonly mfaService: MFAService) { }

    @Get('status')
    async getStatus(@Req() req: any) {
        return this.mfaService.getStatus(req.user.id);
    }

    @Post('setup')
    async setup(@Req() req: any) {
        return this.mfaService.generateSetupData(req.user.id);
    }

    @Post('verify-enable')
    async verifyEnable(@Req() req: any, @Body('token') token: string) {
        return this.mfaService.verifyAndEnable(req.user.id, token);
    }

    @Post('disable')
    async disable(@Req() req: any) {
        return this.mfaService.disable(req.user.id);
    }
}
