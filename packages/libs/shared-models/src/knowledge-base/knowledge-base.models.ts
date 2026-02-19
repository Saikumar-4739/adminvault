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
    id: number;
    title: string;
    content: string;
    category: KnowledgeCategoryEnum;
    authorId: number;
    companyId: number;
    isPublished: boolean;
    viewCount: number;
    tags?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    constructor(id: number, title: string, content: string, category: KnowledgeCategoryEnum, authorId: number, companyId: number, isPublished: boolean, viewCount: number, tags: string[], createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.category = category;
        this.authorId = authorId;
        this.companyId = companyId;
        this.isPublished = isPublished;
        this.viewCount = viewCount;
        this.tags = tags;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class CreateArticleRequestModel {
    title: string;
    content: string;
    category: KnowledgeCategoryEnum;
    authorId: number;
    companyId: number;
    tags?: string[];
    isPublished?: boolean;
    constructor(title: string, content: string, category: KnowledgeCategoryEnum, authorId: number, companyId: number, tags: string[], isPublished: boolean,) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.authorId = authorId;
        this.companyId = companyId;
        this.tags = tags;
        this.isPublished = isPublished;
    }
}

export class UpdateArticleRequestModel {
    id: number;
    title?: string;
    content?: string;
    category?: KnowledgeCategoryEnum;
    tags?: string[];
    isPublished?: boolean;
    editorId: number;
    constructor(id: number, title: string, content: string, category: KnowledgeCategoryEnum, tags: string[], isPublished: boolean, editorId: number) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.category = category;
        this.tags = tags;
        this.isPublished = isPublished;
        this.editorId = editorId;
    }
}

export class SearchArticleRequestModel {
    companyId: number;
    query?: string;
    category?: KnowledgeCategoryEnum;
    constructor(companyId: number, query: string, category?: KnowledgeCategoryEnum) {
        this.companyId = companyId;
        this.query = query;
        this.category = category;
    }
}

export class KnowledgeBaseStatsModel {
    total: number;
    byCategory: Record<string, number>;
    constructor(total: number, byCategory: Record<string, number>) {
        this.total = total;
        this.byCategory = byCategory;
    }
}

export class GetKnowledgeArticleResponseModel extends GlobalResponse {
    article!: KnowledgeArticleModel;
    constructor(status: boolean, code: number, message: string, data: KnowledgeArticleModel) {
        super(status, code, message, data);
        this.article = data;
    }
}

export class GetAllKnowledgeArticlesResponseModel extends GlobalResponse {
    articles!: KnowledgeArticleModel[];
    constructor(status: boolean, code: number, message: string, data: KnowledgeArticleModel[]) {
        super(status, code, message, data);
        this.articles = data;
    }
}

export class GetKnowledgeBaseStatsResponseModel extends GlobalResponse {
    statistics!: KnowledgeBaseStatsModel;
    constructor(status: boolean, code: number, message: string, data: KnowledgeBaseStatsModel) {
        super(status, code, message, data);
        this.statistics = data;
    }
}
