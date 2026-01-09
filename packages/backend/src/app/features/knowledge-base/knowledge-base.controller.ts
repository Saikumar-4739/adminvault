import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateArticleModel, UpdateArticleModel, SearchArticleModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('api/knowledge-base')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
    constructor(private service: KnowledgeBaseService) { }

    @Post('create')
    async create(@Body() model: CreateArticleModel, @Request() req) {
        return await this.service.createArticle(model, req.user.userId, req.user.companyId);
    }

    @Post('update')
    async update(@Body() model: UpdateArticleModel) {
        return await this.service.updateArticle(model);
    }

    @Post('delete/:id')
    async delete(@Param('id') id: number) {
        return await this.service.deleteArticle(id);
    }

    @Get('article/:id')
    async get(@Param('id') id: number) {
        return await this.service.getArticle(id);
    }

    @Post('search')
    async search(@Body() model: SearchArticleModel) {
        return await this.service.searchArticles(model);
    }

    @Get('stats/:companyId')
    async stats(@Param('companyId') companyId: number) {
        return await this.service.getStats(companyId);
    }
}
