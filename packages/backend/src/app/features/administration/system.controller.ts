import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';

@ApiTags('System')
@Controller('administration/system')
@UseGuards(JwtAuthGuard)
export class SystemController {
    constructor(private readonly seedService: SeedService) { }

    @Post('seed')
    async seedAll(): Promise<GlobalResponse> {
        try {
            return await this.seedService.seedAll();
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
