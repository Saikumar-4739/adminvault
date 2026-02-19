import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { KnowledgeArticleEntity } from '../entities/knowledge-article.entity';
import { KnowledgeBaseStatsModel, KnowledgeCategoryEnum, SearchArticleRequestModel } from '@adminvault/shared-models';

@Injectable()
export class KnowledgeItemsRepository extends Repository<KnowledgeArticleEntity> {
    constructor(private dataSource: DataSource) {
        super(KnowledgeArticleEntity, dataSource.createEntityManager());
    }

    async getStats(companyId: number): Promise<KnowledgeBaseStatsModel> {
        const total = await this.count({ where: { companyId } });
        const categories = Object.values(KnowledgeCategoryEnum);
        const byCategory: Record<string, number> = {};

        for (const cat of categories) {
            byCategory[cat] = await this.count({ where: { companyId, category: cat } });
        }
        return new KnowledgeBaseStatsModel(total, byCategory);
    }

    async searchArticles(reqModel: SearchArticleRequestModel): Promise<KnowledgeArticleEntity[]> {
        const queryBuilder = this.createQueryBuilder('article')
            .where('article.companyId = :companyId', { companyId: reqModel.companyId })
            .andWhere('article.isPublished = :isPublished', { isPublished: true });

        if (reqModel.query) {
            queryBuilder.andWhere('(article.title LIKE :q OR article.content LIKE :q)', { q: `%${reqModel.query}%` });
        }

        if (reqModel.category && reqModel.category !== KnowledgeCategoryEnum.OTHER) {
            queryBuilder.andWhere('article.category = :cat', { cat: reqModel.category });
        }

        queryBuilder.orderBy('article.viewCount', 'DESC');

        return await queryBuilder.getMany();
    }
}
