import { Injectable } from '@nestjs/common';
import { KnowledgeItemsRepository } from './repositories/knowledge-items.repository';
import { CreateArticleModel, UpdateArticleModel, SearchArticleModel, GlobalResponse, KnowledgeBaseStatsModel, KnowledgeCategoryEnum } from '@adminvault/shared-models';
import { Like } from 'typeorm';

@Injectable()
export class KnowledgeBaseService {
    constructor(private repo: KnowledgeItemsRepository) { }

    async createArticle(model: CreateArticleModel, authorId: number, companyId: number): Promise<GlobalResponse> {
        const entity = this.repo.create({
            ...model,
            authorId,
            companyId,
            viewCount: 0
        });
        await this.repo.save(entity);
        return new GlobalResponse(true, 201, 'Article created successfully');
    }

    async updateArticle(model: UpdateArticleModel): Promise<GlobalResponse> {
        await this.repo.update(model.id, model);
        return new GlobalResponse(true, 200, 'Article updated successfully');
    }

    async deleteArticle(id: number): Promise<GlobalResponse> {
        await this.repo.delete(id);
        return new GlobalResponse(true, 200, 'Article deleted successfully');
    }

    async getArticle(id: number): Promise<any> {
        const article = await this.repo.findOne({ where: { id }, relations: ['author'] });
        if (article) {
            // Increment view count
            article.viewCount += 1;
            await this.repo.save(article);
        }
        return article;
    }

    async searchArticles(model: SearchArticleModel): Promise<any> {
        const queryBuilder = this.repo.createQueryBuilder('article')
            .where('article.companyId = :companyId', { companyId: model.companyId })
            .andWhere('article.isPublished = :isPublished', { isPublished: true });

        if (model.query) {
            queryBuilder.andWhere('(article.title LIKE :q OR article.content LIKE :q)', { q: `%${model.query}%` });
        }

        if (model.category && model.category !== KnowledgeCategoryEnum.OTHER) { // Assuming ALL logic handled by caller or specific enum check
            queryBuilder.andWhere('article.category = :cat', { cat: model.category });
        }

        queryBuilder.orderBy('article.viewCount', 'DESC');

        return await queryBuilder.getMany();
    }

    async getStats(companyId: number): Promise<KnowledgeBaseStatsModel> {
        const total = await this.repo.count({ where: { companyId } });
        const categories = Object.values(KnowledgeCategoryEnum);
        const byCategory: Record<string, number> = {};

        for (const cat of categories) {
            byCategory[cat] = await this.repo.count({ where: { companyId, category: cat } });
        }

        return { total, byCategory };
    }
}
