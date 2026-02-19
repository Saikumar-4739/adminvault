import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateArticleRequestModel, UpdateArticleRequestModel, SearchArticleRequestModel, GlobalResponse, GetKnowledgeArticleResponseModel, GetAllKnowledgeArticlesResponseModel, GetKnowledgeBaseStatsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { returnException } from '@adminvault/backend-utils';

@ApiTags('Knowledge Base')
@Controller('knowledge-base')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
    constructor(private service: KnowledgeBaseService) { }

    @Post('createArticle')
    @ApiBody({ type: CreateArticleRequestModel })
    async createArticle(@Body() reqModel: CreateArticleRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.createArticle(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateArticle')
    @ApiBody({ type: UpdateArticleRequestModel })
    async updateArticle(@Body() reqModel: UpdateArticleRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateArticle(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteArticle')
    @ApiBody({ type: IdRequestModel })
    async deleteArticle(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteArticle(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getArticle')
    @ApiBody({ type: IdRequestModel })
    async getArticle(@Body() reqModel: IdRequestModel): Promise<GetKnowledgeArticleResponseModel> {
        try {
            return await this.service.getArticle(reqModel);
        } catch (error) {
            return returnException(GetKnowledgeArticleResponseModel, error);
        }
    }

    @Post('searchArticles')
    @ApiBody({ type: SearchArticleRequestModel })
    async searchArticles(@Body() reqModel: SearchArticleRequestModel): Promise<GetAllKnowledgeArticlesResponseModel> {
        try {
            return await this.service.searchArticles(reqModel);
        } catch (error) {
            return returnException(GetAllKnowledgeArticlesResponseModel, error);
        }
    }

    @Post('getStats')
    @ApiBody({ type: IdRequestModel })
    async getStats(@Body() reqModel: IdRequestModel): Promise<GetKnowledgeBaseStatsResponseModel> {
        try {
            return await this.service.getStats(reqModel);
        } catch (error) {
            return returnException(GetKnowledgeBaseStatsResponseModel, error);
        }
    }
}
