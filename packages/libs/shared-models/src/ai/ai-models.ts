import { GlobalResponse } from '../common/global-response';

export class AiQueryRequest {
    query: string;
    context?: string; // Optional context (e.g., current page)
    constructor(query: string, context?: string) {
        this.query = query;
        this.context = context;
    }
}

export class AiQueryResponse extends GlobalResponse {
    response: string; // Markdown formatted text
    intent: string;   // Detected intent (e.g., 'search', 'count', 'list')
    entity: string;   // Detected entity (e.g., 'ticket', 'employee')
    data?: any[];     // Raw data for optional UI rendering

    constructor(
        status: boolean,
        code: number,
        message: string,
        response: string,
        intent: string = 'unknown',
        entity: string = 'none',
        data: any[] = []
    ) {
        super(status, code, message);
        this.response = response;
        this.intent = intent;
        this.entity = entity;
        this.data = data;
    }
}
