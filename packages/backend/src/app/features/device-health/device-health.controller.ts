import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DeviceHealthService } from './device-health.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Device Health')
@Controller('device-health')
@UseGuards(JwtAuthGuard)
export class DeviceHealthController {
    constructor(private readonly service: DeviceHealthService) { }

    @Get('list')
    @ApiOperation({ summary: 'Get health status for all managed devices' })
    async list(@Request() req: any) {
        return this.service.getDeviceHealthList(req.user.companyId);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get summary health statistics' })
    async stats(@Request() req: any) {
        return this.service.getDeviceStats(req.user.companyId);
    }
}
