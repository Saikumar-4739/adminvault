import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiBotService } from './ai-bot.service';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiBotController {
    constructor(private readonly aiService: AiBotService) { }

    @Post('query')
    async query(@Body() body: { query: string }, @Request() req) {
        // Assume user is attached to req by JwtStrategy
        const companyId = req.user.companyId;
        return await this.aiService.processQuery(body.query, companyId);
    }
}
