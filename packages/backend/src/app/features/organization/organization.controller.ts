import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Organization')
@Controller('organization')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
    constructor(private readonly service: OrganizationService) { }

    @Get('billing')
    @ApiOperation({ summary: 'Get billing and subscription info' })
    async getBilling(@Request() req: any) {
        return this.service.getBilling(req.user.companyId);
    }

    @Get('vendors')
    @ApiOperation({ summary: 'Get all vendors' })
    async getVendors(@Request() req: any) {
        return this.service.getVendors(req.user.companyId);
    }

    @Post('vendors')
    @ApiOperation({ summary: 'Create a new vendor' })
    async createVendor(@Request() req: any, @Body() data: any) {
        return this.service.createVendor(req.user.companyId, data);
    }

    @Get('invoices')
    @ApiOperation({ summary: 'Get billing invoices' })
    async getInvoices(@Request() req: any) {
        return this.service.getInvoices(req.user.companyId);
    }
}
