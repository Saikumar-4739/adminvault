import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeItemsRepository } from './repositories/knowledge-items.repository';
import { KnowledgeArticleEntity } from './entities/knowledge-article.entity';

@Module({
    imports: [TypeOrmModule.forFeature([KnowledgeArticleEntity])],
    controllers: [KnowledgeBaseController],
    providers: [KnowledgeBaseService, KnowledgeItemsRepository],
    exports: [KnowledgeBaseService]
})
export class KnowledgeBaseModule { }
