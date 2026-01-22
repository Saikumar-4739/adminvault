import { GlobalResponse } from '../common/global-response';

export enum KnowledgeCategoryEnum {
    IT_POLICY = 'IT_POLICY',
    TROUBLESHOOTING = 'TROUBLESHOOTING',
    HOW_TO = 'HOW_TO',
    SOFTWARE = 'SOFTWARE',
    HARDWARE = 'HARDWARE',
    SECURITY = 'SECURITY',
    OTHER = 'OTHER'
}

export class KnowledgeArticleModel {
    id!: number;
    title!: string;
    content!: string;
    category!: KnowledgeCategoryEnum;
    tags?: string[];
    authorId!: number;
    companyId!: number;
    isPublished!: boolean;
    viewCount!: number;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(partial?: Partial<KnowledgeArticleModel>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}

export class CreateArticleRequestModel {
    title!: string;
    content!: string;
    category!: KnowledgeCategoryEnum;
    tags?: string[];
    isPublished?: boolean;
    authorId!: number;
    companyId!: number;
}

export class UpdateArticleRequestModel {
    id!: number;
    title?: string;
    content?: string;
    category?: KnowledgeCategoryEnum;
    tags?: string[];
    isPublished?: boolean;
}

export class SearchArticleRequestModel {
    companyId!: number;
    query?: string;
    category?: KnowledgeCategoryEnum;
}

export class KnowledgeBaseStatsModel {
    total!: number;
    byCategory!: Record<string, number>;

    constructor(total: number, byCategory: Record<string, number>) {
        this.total = total;
        this.byCategory = byCategory;
    }
}

export class GlobalKnowledgeArticleResponseModel extends GlobalResponse<KnowledgeArticleModel> {
    article!: KnowledgeArticleModel;
    constructor(status: boolean, code: number, message: string, data: KnowledgeArticleModel) {
        super(status, code, message, data);
        this.article = data;
    }
}

export class GetKnowledgeArticleResponseModel extends GlobalKnowledgeArticleResponseModel { }

export class GetAllKnowledgeArticlesResponseModel extends GlobalResponse<KnowledgeArticleModel[]> {
    articles!: KnowledgeArticleModel[];
    constructor(status: boolean, code: number, message: string, data: KnowledgeArticleModel[]) {
        super(status, code, message, data);
        this.articles = data;
    }
}

export class GetKnowledgeBaseStatsResponseModel extends GlobalResponse<KnowledgeBaseStatsModel> {
    statistics!: KnowledgeBaseStatsModel;
    constructor(status: boolean, code: number, message: string, data: KnowledgeBaseStatsModel) {
        super(status, code, message, data);
        this.statistics = data;
    }
}
