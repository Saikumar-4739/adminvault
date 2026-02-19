import { Injectable } from '@nestjs/common';
import { KnowledgeItemsRepository } from './repositories/knowledge-items.repository';
import { CreateArticleRequestModel, UpdateArticleRequestModel, SearchArticleRequestModel, GlobalResponse, GetKnowledgeArticleResponseModel, GetAllKnowledgeArticlesResponseModel, GetKnowledgeBaseStatsResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { ErrorResponse } from '@adminvault/backend-utils';
import { AuthUsersService } from '../auth-users/auth-users.service';

@Injectable()
export class KnowledgeBaseService {
    constructor(
        private repo: KnowledgeItemsRepository,
        private authService: AuthUsersService
    ) { }

    async createArticle(reqModel: CreateArticleRequestModel): Promise<GlobalResponse> {
        try {
            await this.authService.getMe(reqModel.authorId);
            const entity = this.repo.create({ ...reqModel, userId: reqModel.authorId, viewCount: 0 });
            await this.repo.save(entity);
            return new GlobalResponse(true, 201, 'Article created successfully');
        } catch (error) {
            throw error;
        }
    }

    async updateArticle(reqModel: UpdateArticleRequestModel): Promise<GlobalResponse> {
        try {
            const existing = await this.repo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Article not found');
            }
            await this.repo.update(reqModel.id, reqModel);
            return new GlobalResponse(true, 200, 'Article updated successfully');
        } catch (error) {
            throw error;
        }
    }

    async deleteArticle(reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            const id = reqModel.id;
            const existing = await this.repo.findOne({ where: { id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Article not found');
            }
            await this.repo.delete(id);
            return new GlobalResponse(true, 200, 'Article deleted successfully');
        } catch (error) {
            throw error;
        }
    }

    async getArticle(reqModel: IdRequestModel): Promise<GetKnowledgeArticleResponseModel> {
        try {
            const id = reqModel.id;
            const article = await this.repo.findOne({ where: { id } });
            if (!article) {
                throw new ErrorResponse(404, 'Article not found');
            }
            article.viewCount += 1;
            await this.repo.save(article);
            return new GetKnowledgeArticleResponseModel(true, 200, 'Article retrieved successfully', article as any);
        } catch (error) {
            throw error;
        }
    }

    async searchArticles(reqModel: SearchArticleRequestModel): Promise<GetAllKnowledgeArticlesResponseModel> {
        try {
            const articles = await this.repo.searchArticles(reqModel);
            return new GetAllKnowledgeArticlesResponseModel(true, 200, 'Articles retrieved successfully', articles as any);
        } catch (error) {
            throw error;
        }
    }

    async getStats(reqModel: IdRequestModel): Promise<GetKnowledgeBaseStatsResponseModel> {
        try {
            const stats = await this.repo.getStats(reqModel.id);
            return new GetKnowledgeBaseStatsResponseModel(true, 200, 'Statistics retrieved successfully', stats);
        } catch (error) {
            throw error;
        }
    }
}   
