export enum KnowledgeCategoryEnum {
    IT_POLICY = 'IT_POLICY',
    TROUBLESHOOTING = 'TROUBLESHOOTING',
    HOW_TO = 'HOW_TO',
    SOFTWARE = 'SOFTWARE',
    HARDWARE = 'HARDWARE',
    SECURITY = 'SECURITY',
    OTHER = 'OTHER'
}

export interface KnowledgeArticleModel {
    id: number;
    title: string;
    content: string; // HTML or Markdown
    category: KnowledgeCategoryEnum;
    tags?: string[];
    authorId: number;
    companyId: number;
    isPublished: boolean;
    viewCount: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export class CreateArticleModel {
    title: string;
    content: string;
    category: KnowledgeCategoryEnum;
    tags?: string[];
    isPublished?: boolean;

    constructor(title: string, content: string, category: KnowledgeCategoryEnum, tags: string[] = [], isPublished: boolean = true) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.tags = tags;
        this.isPublished = isPublished;
    }
}

export class UpdateArticleModel {
    id: number;
    title?: string;
    content?: string;
    category?: KnowledgeCategoryEnum;
    tags?: string[];
    isPublished?: boolean;

    constructor(id: number) {
        this.id = id;
    }
}

export class SearchArticleModel {
    companyId: number;
    query?: string;
    category?: KnowledgeCategoryEnum;

    constructor(companyId: number, query?: string, category?: KnowledgeCategoryEnum) {
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
