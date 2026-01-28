import { Injectable } from '@nestjs/common';
import { KnowledgeItemsRepository } from './repositories/knowledge-items.repository';
import { CreateArticleRequestModel, UpdateArticleRequestModel, SearchArticleRequestModel, GlobalResponse, KnowledgeBaseStatsModel, KnowledgeCategoryEnum, GetKnowledgeArticleResponseModel, GetAllKnowledgeArticlesResponseModel, GetKnowledgeBaseStatsResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class KnowledgeBaseService {
    constructor(private repo: KnowledgeItemsRepository) { }

    async createArticle(reqModel: CreateArticleRequestModel): Promise<GlobalResponse> {
        try {
            const entity = this.repo.create({
                ...reqModel,
                viewCount: 0
            });
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
            const article = await this.repo.findOne({ where: { id }, relations: ['author'] });
            if (!article) {
                throw new ErrorResponse(404, 'Article not found');
            }
            // Increment view count
            article.viewCount += 1;
            await this.repo.save(article);

            return new GetKnowledgeArticleResponseModel(true, 200, 'Article retrieved successfully', article as any);
        } catch (error) {
            throw error;
        }
    }

    async searchArticles(reqModel: SearchArticleRequestModel): Promise<GetAllKnowledgeArticlesResponseModel> {
        try {
            const queryBuilder = this.repo.createQueryBuilder('article')
                .where('article.companyId = :companyId', { companyId: reqModel.companyId })
                .andWhere('article.isPublished = :isPublished', { isPublished: true });

            if (reqModel.query) {
                queryBuilder.andWhere('(article.title LIKE :q OR article.content LIKE :q)', { q: `%${reqModel.query}%` });
            }

            if (reqModel.category && reqModel.category !== KnowledgeCategoryEnum.OTHER) {
                queryBuilder.andWhere('article.category = :cat', { cat: reqModel.category });
            }

            queryBuilder.orderBy('article.viewCount', 'DESC');

            const articles = await queryBuilder.getMany();
            return new GetAllKnowledgeArticlesResponseModel(true, 200, 'Articles retrieved successfully', articles as any);
        } catch (error) {
            throw error;
        }
    }

    async getStats(reqModel: CompanyIdRequestModel): Promise<GetKnowledgeBaseStatsResponseModel> {
        try {
            const companyId = reqModel.companyId;
            const total = await this.repo.count({ where: { companyId } });
            const categories = Object.values(KnowledgeCategoryEnum);
            const byCategory: Record<string, number> = {};

            for (const cat of categories) {
                byCategory[cat] = await this.repo.count({ where: { companyId, category: cat } });
            }

            const stats = new KnowledgeBaseStatsModel(total, byCategory);
            return new GetKnowledgeBaseStatsResponseModel(true, 200, 'Statistics retrieved successfully', stats);
        } catch (error) {
            throw error;
        }
    }
}
