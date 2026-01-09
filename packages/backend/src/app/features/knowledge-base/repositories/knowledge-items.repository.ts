import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { KnowledgeArticleEntity } from '../entities/knowledge-article.entity';

@Injectable()
export class KnowledgeItemsRepository extends Repository<KnowledgeArticleEntity> {
    constructor(private dataSource: DataSource) {
        super(KnowledgeArticleEntity, dataSource.createEntityManager());
    }
}
