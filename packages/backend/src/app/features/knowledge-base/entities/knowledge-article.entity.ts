import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KnowledgeCategoryEnum } from '@adminvault/shared-models';
import { CompanyInfoEntity } from '../../masters/company-info/entities/company-info.entity';
import { AuthUsersEntity } from '../../auth-users/entities/auth-users.entity';

@Entity('knowledge_articles')
export class KnowledgeArticleEntity {
    @PrimaryGeneratedColumn()
    id: number;

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

    @Column({ nullable: true })
    companyId: number;

    @ManyToOne(() => CompanyInfoEntity)
    @JoinColumn({ name: 'companyId' })
    company: CompanyInfoEntity;

    @Column({ nullable: true })
    authorId: number;

    @ManyToOne(() => AuthUsersEntity)
    @JoinColumn({ name: 'authorId' })
    author: AuthUsersEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
