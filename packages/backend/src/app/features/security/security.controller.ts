import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { SecurityService } from './security.service';

@ApiTags('Security')
@Controller('security')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SecurityController {
    constructor(private readonly securityService: SecurityService) { }

    @Get('threats/:companyId')
    @ApiOperation({ summary: 'Get active security threats for a company' })
    async getThreats(@Param('companyId') companyId: number) {
        const data = await this.securityService.getThreats(companyId);
        return { status: true, data };
    }

    @Get('protocols/:companyId')
    @ApiOperation({ summary: 'Get security protocols for a company' })
    async getProtocols(@Param('companyId') companyId: number) {
        const data = await this.securityService.getProtocols(companyId);
        return { status: true, data };
    }
}
