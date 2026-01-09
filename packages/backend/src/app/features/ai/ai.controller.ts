import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('query')
    async query(@Body() body: { query: string }, @Request() req) {
        // Assume user is attached to req by JwtStrategy
        const companyId = req.user.companyId;
        return await this.aiService.processQuery(body.query, companyId);
    }
}
