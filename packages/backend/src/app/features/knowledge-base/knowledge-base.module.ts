import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeItemsRepository } from './repositories/knowledge-items.repository';
import { KnowledgeArticleEntity } from './entities/knowledge-article.entity';
import { AuthUsersModule } from '../auth-users/auth-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([KnowledgeArticleEntity]), forwardRef(() => AuthUsersModule)],
    controllers: [KnowledgeBaseController],
    providers: [KnowledgeBaseService, KnowledgeItemsRepository],
    exports: [KnowledgeBaseService]
})
export class KnowledgeBaseModule { }
