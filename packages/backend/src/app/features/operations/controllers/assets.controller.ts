import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AssetsService } from '../services/assets.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../guards/permissions.guard';
import { RequirePermission } from '../../../decorators/permissions.decorator';
import { AssetInfoEntity } from '../../../entities/asset-info.entity';

@Controller('operations/assets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get()
    @RequirePermission('Asset', 'READ')
    async findAll(@Query() filters: any) {
        return this.assetsService.findAll(filters);
    }

    @Get('expiring-warranty')
    @RequirePermission('Asset', 'READ')
    async getExpiringWarranty(@Query('days') days?: string) {
        return this.assetsService.getExpiringWarranty(days ? parseInt(days) : 30);
    }

    @Get(':id')
    @RequirePermission('Asset', 'READ')
    async findOne(@Param('id') id: string) {
        return this.assetsService.getDetailsWithHistory(parseInt(id));
    }

    @Post()
    @RequirePermission('Asset', 'CREATE')
    async create(@Body() data: Partial<AssetInfoEntity>) {
        return this.assetsService.create(data);
    }

    @Put(':id')
    @RequirePermission('Asset', 'UPDATE')
    async update(@Param('id') id: string, @Body() data: Partial<AssetInfoEntity>) {
        return this.assetsService.update(parseInt(id), data);
    }

    @Post(':id/assign')
    @RequirePermission('Asset', 'ASSIGN')
    async assign(
        @Param('id') id: string,
        @Body('employeeId') employeeId: number,
        @Body('remarks') remarks: string,
        @Req() req: any
    ) {
        return this.assetsService.assignAsset(parseInt(id), employeeId, req.user.id, remarks);
    }

    @Post(':id/return')
    @RequirePermission('Asset', 'ASSIGN')
    async returnAsset(@Param('id') id: string, @Body('remarks') remarks: string) {
        return this.assetsService.returnAsset(parseInt(id), remarks);
    }
}
