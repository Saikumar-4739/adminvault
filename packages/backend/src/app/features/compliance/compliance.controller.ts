import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Compliance')
@Controller('compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
    constructor(private readonly service: ComplianceService) { }

    @Get('policies')
    @ApiOperation({ summary: 'Get all company policies' })
    async getPolicies(@Request() req: any) {
        return this.service.getPolicies(req.user.companyId);
    }

    @Get('reviews')
    @ApiOperation({ summary: 'Get all access reviews' })
    async getReviews(@Request() req: any) {
        return this.service.getAccessReviews(req.user.companyId);
    }

    @Post('policies')
    @ApiOperation({ summary: 'Create a new policy' })
    async createPolicy(@Request() req: any, @Body() data: any) {
        return this.service.createPolicy(req.user.companyId, req.user.id, data);
    }

    @Post('reviews')
    @ApiOperation({ summary: 'Create a new access review' })
    async createReview(@Request() req: any, @Body() data: any) {
        return this.service.createReview(req.user.companyId, data);
    }
}
