import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { KnowledgeCategoryEnum } from '@adminvault/shared-models';
import { CommonBaseEntity } from '../../../../database/common-base.entity';

@Entity('knowledge_articles')
export class KnowledgeArticleEntity extends CommonBaseEntity {

    @Column()
    title: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'simple-enum', enum: KnowledgeCategoryEnum, default: KnowledgeCategoryEnum.OTHER })
    category: KnowledgeCategoryEnum;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @Column({ default: true })
    isPublished: boolean;

    @Column({ default: 0 })
    viewCount: number;

}
