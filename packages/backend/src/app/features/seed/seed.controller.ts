import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('System Seed')
@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Post('run')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Populate demo data for the current company' })
    async runSeed(@Request() req: any) {
        return this.seedService.seedAll(req.user.companyId, req.user.id);
    }
}
