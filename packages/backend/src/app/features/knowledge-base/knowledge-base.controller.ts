import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateArticleRequestModel, UpdateArticleRequestModel, SearchArticleRequestModel, GlobalResponse, GetKnowledgeArticleResponseModel, GetAllKnowledgeArticlesResponseModel, GetKnowledgeBaseStatsResponseModel } from '@adminvault/shared-models';
import { CompanyIdDto, IdDto } from '../../common/dto/common.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { returnException } from '@adminvault/backend-utils';
import { IAuthenticatedRequest } from '../../interfaces/auth.interface';

@ApiTags('Knowledge Base')
@Controller('knowledge-base')
@UseGuards(JwtAuthGuard)
export class KnowledgeBaseController {
    constructor(private service: KnowledgeBaseService) { }

    @Post('createArticle')
    @AuditLog({ action: 'CREATE', module: 'KnowledgeBase' })
    @ApiBody({ type: CreateArticleRequestModel })
    async createArticle(@Body() reqModel: CreateArticleRequestModel, @Request() req: IAuthenticatedRequest): Promise<GlobalResponse> {
        try {
            reqModel.authorId = req.user.userId;
            reqModel.companyId = req.user.companyId;
            return await this.service.createArticle(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateArticle')
    @AuditLog({ action: 'UPDATE', module: 'KnowledgeBase' })
    @ApiBody({ type: UpdateArticleRequestModel })
    async updateArticle(@Body() reqModel: UpdateArticleRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateArticle(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteArticle')
    @AuditLog({ action: 'DELETE', module: 'KnowledgeBase' })
    @ApiBody({ type: IdDto })
    async deleteArticle(@Body() reqModel: IdDto): Promise<GlobalResponse> {
        try {
            return await this.service.deleteArticle(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getArticle')
    @ApiBody({ type: IdDto })
    async getArticle(@Body() reqModel: IdDto): Promise<GetKnowledgeArticleResponseModel> {
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
    @ApiBody({ type: CompanyIdDto })
    async getStats(@Body() reqModel: CompanyIdDto): Promise<GetKnowledgeBaseStatsResponseModel> {
        try {
            return await this.service.getStats(reqModel);
        } catch (error) {
            return returnException(GetKnowledgeBaseStatsResponseModel, error);
        }
    }
}
