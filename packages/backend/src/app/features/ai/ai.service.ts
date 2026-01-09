import { Injectable } from '@nestjs/common';
import { DataSource, Like } from 'typeorm';
import { EmployeesService } from '../employees/employees.service';
import { TicketsService } from '../tickets/tickets.service';
import { AssetInfoService } from '../asset-info/asset-info.service';
import { TicketStatusEnum } from '@adminvault/shared-models';
import { AiQueryResponse } from '@adminvault/shared-models';
// Entities for direct access
// import { DocumentsEntity } from '../documents/entities/documents.entity'; // Check filename
// import { LicensesEntity } from '../licenses/entities/licenses.entity'; // Check filename

@Injectable()
export class AiService {
    // 🧠 THE BRAIN: Knowledge Graph of the Database
    private readonly SCHEMA = {
        employee: {
            repo: 'EmployeesEntity',
            keywords: ['employee', 'user', 'staff', 'worker', 'person', 'people', 'email', 'contact'],
            columns: ['firstName', 'lastName', 'email', 'designation', 'departmentId'],
            searchCols: ['firstName', 'lastName', 'email'],
            emoji: '👤'
        },
        ticket: {
            repo: 'TicketsEntity',
            keywords: ['ticket', 'issue', 'request', 'complaint', 'bug', 'help', 'support', 'open', 'pending'],
            columns: ['ticketCode', 'subject', 'priorityEnum', 'ticketStatus', 'createdAt'],
            searchCols: ['subject', 'ticketCode'],
            emoji: '🎫'
        },
        asset: {
            repo: 'AssetInfoEntity',
            keywords: ['asset', 'device', 'laptop', 'machine', 'equipment', 'inventory', 'serial', 'model'],
            columns: ['serialNumber', 'model', 'brandId', 'assetStatusEnum'],
            searchCols: ['serialNumber', 'model', 'configuration'],
            emoji: '💻'
        },
        document: {
            repo: 'DocumentsEntity',
            keywords: ['document', 'file', 'doc', 'pdf', 'paper', 'contract', 'invoice'],
            columns: ['title', 'documentNumber', 'description'],
            searchCols: ['title', 'documentNumber'],
            emoji: '📄'
        },
        license: {
            repo: 'LicensesEntity',
            keywords: ['license', 'key', 'software', 'subscription', 'expiry'],
            columns: ['softwareName', 'licenseKey', 'expiryDate'],
            searchCols: ['softwareName', 'licenseKey'],
            emoji: '🔑'
        },
        vendor: {
            repo: 'VendorsEntity',
            keywords: ['vendor', 'supplier', 'seller', 'merchant', 'provider'],
            columns: ['vendorName', 'email', 'contactPerson', 'phNumber'],
            searchCols: ['vendorName', 'email'],
            emoji: '🏢'
        },
        department: {
            repo: 'DepartmentEntity',
            keywords: ['department', 'team', 'group', 'unit', 'division'],
            columns: ['departmentName', 'departmentCode'],
            searchCols: ['departmentName'],
            emoji: '👥'
        }
    };

    constructor(private readonly dataSource: DataSource) { }

    async processQuery(query: string, companyId: number): Promise<AiQueryResponse> {
        const cleanQuery = query.toLowerCase().trim();

        // 1. SMART INTENT DETECTION (Scoring System)
        const bestMatch = this.detectEntity(cleanQuery);

        try {
            if (bestMatch.confidence > 0) {
                const schema = this.SCHEMA[bestMatch.entity];

                // A. COUNT INTENT
                if (query.match(/count|how many|total|stats/i)) {
                    const count = await this.dataSource.getRepository(schema.repo).count({ where: { companyId } });
                    const text = `### ${schema.emoji} ${this.capitalize(bestMatch.entity)} Statistics\n\n**Total Count:** ${count} items found in database.`;
                    return new AiQueryResponse(true, 200, "Count success", text, 'count', bestMatch.entity, [{ count }]);
                }

                // B. SMART SEARCH (REGEX & TOKEN BASED)
                const searchStrategy = this.analyzeSearchStrategy(query, bestMatch.entity);

                if (searchStrategy.term) {
                    let whereConditions = [];

                    if (searchStrategy.type === 'email') {
                        // Strict Email Search
                        whereConditions = schema.columns.filter(c => c.toLowerCase().includes('email')).map(col => ({ [col]: searchStrategy.term, companyId }));
                    } else if (searchStrategy.type === 'code') {
                        // Strict Code Search
                        whereConditions = schema.columns.filter(c => c.toLowerCase().includes('code') || c.toLowerCase().includes('number')).map(col => ({ [col]: searchStrategy.term, companyId }));
                    } else {
                        // Fuzzy / Token Search
                        // If multiple words, try to match ANY of the search columns with ANY of the words
                        // But preferred: The term is likely a name "John Doe"
                        // TypeORM find with OR: [ { col1: Like(%term%) }, { col2: Like(%term%) } ]
                        whereConditions = schema.searchCols.map(col => ({ [col]: Like(`%${searchStrategy.term}%`), companyId }));
                    }

                    if (whereConditions.length === 0) {
                        // Fallback if no specific columns identified for strict search
                        whereConditions = schema.searchCols.map(col => ({ [col]: Like(`%${searchStrategy.term}%`), companyId }));
                    }

                    const results = await this.dataSource.getRepository(schema.repo).find({ where: whereConditions, take: 5 });

                    if (results.length > 0) {
                        const table = this.formatAsTable(results, schema.columns, `${bestMatch.entity} Results for "${searchStrategy.term}"`);
                        return new AiQueryResponse(true, 200, "Search success", table, 'search', bestMatch.entity, results);
                    }
                    return new AiQueryResponse(true, 200, "No results", `I looked for **${searchStrategy.term}** in ${bestMatch.entity}s but found nothing.`, 'search', bestMatch.entity);
                }

                // C. LIST INTENT (Default)
                const recentItems = await this.dataSource.getRepository(schema.repo).find({
                    where: { companyId },
                    take: 5,
                    order: { id: 'DESC' } as any
                });
                const listTable = this.formatAsTable(recentItems, schema.columns, `Latest ${bestMatch.entity}s`);
                return new AiQueryResponse(true, 200, "List success", listTable, 'list', bestMatch.entity, recentItems);
            }

            // 2. FALLBACK: UNIVERSAL DEEP SEARCH
            return await this.universalDeepSearch(cleanQuery, companyId);

        } catch (error) {
            console.error('AI Error:', error);
            return new AiQueryResponse(false, 500, "Error", "I tried to access the database but encountered a schema error. Please verify the table names.", 'error', 'none');
        }
    }

    // --- INTELLIGENCE CORE ---

    /**
     * Scores the query against keywords to find the most likely entity user is talking about.
     */
    private detectEntity(query: string) {
        let bestEntity = '';
        let maxScore = 0;

        for (const [key, config] of Object.entries(this.SCHEMA)) {
            let score = 0;
            // Exact entity name match
            if (query.includes(key)) score += 10;
            // Plural match
            if (query.includes(key + 's')) score += 10;

            // Keyword matching
            config.keywords.forEach(word => {
                if (query.includes(word)) score += 5;
            });

            if (score > maxScore) {
                maxScore = score;
                bestEntity = key;
            }
        }

        return { entity: bestEntity, confidence: maxScore };
    }

    private analyzeSearchStrategy(query: string, entity: string): { type: 'email' | 'code' | 'text', term: string } {
        // 1. Email Detection
        const emailMatch = query.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) return { type: 'email', term: emailMatch[0] };

        // 2. Code/ID Detection (e.g., TKT-123, #123)
        // const codeMatch = query.match(/\b[A-Z]{3}-\d+\b|\b\d{4,}\b/);
        // if (codeMatch) return { type: 'code', term: codeMatch[0] };

        // 3. Text Extraction (Parameter)
        let term = query;
        // Stop words removal
        const stopWords = ['find', 'search', 'lookup', 'show', 'list', 'give', 'me', 'who', 'is', 'where', 'what', 'the', 'for', 'details', 'about', 'hi', 'hello', 'i', 'need', 'want', 'of', 'in', 'with', 'id', 'mail', 'using', 'address'];

        // Remove Entity names as well
        const entityWords = [entity, entity + 's', ...this.SCHEMA[entity].keywords];

        const allRemove = [...stopWords, ...entityWords];

        // Replace one by one
        allRemove.forEach(w => {
            term = term.replace(new RegExp(`\\b${w}\\b`, 'gi'), ' ');
        });

        // Clean up whitespace
        term = term.replace(/\s+/g, ' ').trim();

        return { type: 'text', term };
    }

    // --- DATA FORMATTER ---

    private formatAsTable(data: any[], columns: string[], title: string): string {
        if (!data || data.length === 0) return "No data found.";

        let md = `### ${title}\n\n`;

        // Header
        const headers = columns.map(c => this.capitalize(c.replace(/Id|Enum|Code/g, '')));
        md += `| ${headers.join(' | ')} |\n`;
        md += `| ${headers.map(() => '---').join(' | ')} |\n`;

        // Rows
        data.forEach(row => {
            const values = columns.map(col => {
                let val = row[col];
                // Handle Nested Objects (e.g. employee.department) if flattened or simple
                if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
                    val = '[Object]';
                }
                // Handle Dates
                if (val instanceof Date) val = val.toISOString().split('T')[0];
                // Handle Empty
                if (val === null || val === undefined) val = '-';
                return val;
            });
            md += `| ${values.join(' | ')} |\n`;
        });

        return md;
    }

    private capitalize(s: string) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    private async universalDeepSearch(term: string, companyId: number): Promise<AiQueryResponse> {
        let report = `### 🔍 Universal Search Results for "${term}"\n`;
        let found = false;
        let allResults = [];

        // Clean term
        let cleanTerm = term;
        const emailMatch = term.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            cleanTerm = emailMatch[0];
        } else {
            cleanTerm = cleanTerm.replace(/find|search|lookup|hi|hello|i|need|details/gi, '').trim();
        }

        if (cleanTerm.length < 2) return new AiQueryResponse(true, 200, "Term too short", "Please provide a longer keyword to search.", 'short_term', 'none');

        for (const [key, schema] of Object.entries(this.SCHEMA)) {
            const whereConditions = schema.searchCols.map(col => ({ [col]: Like(`%${cleanTerm}%`), companyId }));
            try {
                const results = await this.dataSource.getRepository(schema.repo).find({ where: whereConditions, take: 3 });
                if (results.length > 0) {
                    found = true;
                    allResults.push(...results);
                    report += `\n**${schema.emoji} ${this.capitalize(key)}s**\n`;
                    results.forEach((r: any) => {
                        const display = r[schema.searchCols[0]] || r[schema.columns[0]] || 'Unknown';
                        report += `- ${display}\n`;
                    });
                }
            } catch (e) {
                // Ignore missing tables
            }
        }

        const msg = found ? report : `I scanned the database for "**${cleanTerm}**" across Tickets, Employees, and Assets but found nothing.`;
        return new AiQueryResponse(true, 200, "Universal search", msg, 'universal_search', 'mixed', allResults);
    }
}
