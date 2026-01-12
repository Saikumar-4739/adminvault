import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiQueryResponse } from '@adminvault/shared-models';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Entities
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private hasApiKey = false;

    // 🧠 KNOWLEDGE GRAPH: Database Schema Definition for the AI
    private readonly SCHEMA_CONTEXT = `
    You are AdminVault AI, an advanced enterprise administrator assistant.
    
    SYSTEM CAPABILITIES:
    - You have direct access to "Assets", "Employees", and "Tickets" databases.
    - User Query -> You Analyze Intent -> You Decide Best Visualization -> You Return Data.

    AVAILABLE DATA ENTITIES:

    1. ASSETS (Repository: AssetInfoEntity)
       - Keywords: asset, device, laptop, macbook, monitor, equipment, machine, computer
       - Fields: 
         * serialNumber (unique id)
         * model (e.g., MacBook Pro, Dell Latitude)
         * assetStatusEnum (AVAILABLE, IN_USE, MAINTENANCE, RETIRED)
         * complianceStatus (COMPLIANT, NON_COMPLIANT, PENDING)
         * batteryLevel (0-100)
         * storageAvailable (e.g. 100 GB)
         * osVersion (e.g. macOS 14, Windows 11)
         * ipAddress, macAddress
         * lastSync (Date)
    
    2. EMPLOYEES (Repository: EmployeesEntity)
       - Keywords: employee, user, staff, person, worker, team member
       - Fields: firstName, lastName, email, designation, departmentId
    
    3. TICKETS (Repository: TicketsEntity)
       - Keywords: ticket, issue, support, help, request, complaint, bug
       - Fields: ticketCode, subject, priorityEnum, ticketStatus (OPEN, CLOSED)
    `;

    constructor(
        private readonly dataSource: DataSource,
        private readonly configService: ConfigService
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            this.hasApiKey = true;
        } else {
            this.logger.warn('GEMINI_API_KEY is not set. AI features will run in limited REGEX mode.');
        }
    }

    /**
     * Main Entry Point: Process a natural language query
     */
    async processQuery(query: string, companyId: number): Promise<AiQueryResponse> {
        try {
            // 1. Try Advanced LLM Processing if available
            if (this.hasApiKey) {
                return await this.processWithGemini(query, companyId);
            }

            // 2. Fallback to Regex/Keywords if no API Key
            return await this.processWithHeuristics(query, companyId);

        } catch (error) {
            this.logger.error(`AI Processing Error: ${error.message}`, error.stack);
            if (this.hasApiKey) {
                return await this.processWithHeuristics(query, companyId);
            }
            return new AiQueryResponse(false, 500, "Error", "I encountered an internal error processing your request.", 'error', 'none');
        }
    }

    /**
     * OPTION A: Advanced Gemini-Powered Intent Analysis
     */
    private async processWithGemini(query: string, companyId: number): Promise<AiQueryResponse> {
        // Step 1: Intent Classification & Parameter Extraction
        const analysis = await this.analyzeQueryWithLLM(query);

        if (analysis.type === 'CHIT_CHAT' || analysis.type === 'UNKNOWN') {
            return new AiQueryResponse(true, 200, "Response", analysis.response, 'chat', 'none');
        }

        // Step 2: Execute Data Retrieval based on AI instructions
        let results = [];
        let entity = 'none';

        if (analysis.type === 'QUERY_DATA') {
            entity = analysis.entity;

            // If it's a COUNT query, optimization
            if (analysis.visualization == 'stat_card') {
                const count = await this.executeCountQuery(analysis.entity, analysis.filters, companyId);
                results = [{ count, label: `Total ${this.capitalize(analysis.entity)}s` }];
            } else {
                results = await this.executeSafeQuery(analysis.entity, analysis.filters, analysis.searchTerm, companyId);
            }
        }

        // Step 3: Analytics & Summarization
        if (results.length > 0) {
            const summary = await this.summarizeResultsWithLLM(query, results, analysis.visualization);
            // Return structured intent to Frontend so it knows how to render (Table vs Card vs Chart)
            return new AiQueryResponse(true, 200, "Success", summary, analysis.visualization, entity, results);
        } else {
            return new AiQueryResponse(true, 200, "No Data", `I understood you are looking for **${analysis.entity}** related to "${analysis.searchTerm || query}", but I couldn't find any matching records in the database.`, 'search', entity);
        }
    }

    /**
     * Ask Gemini to parse the user's natural language into structured JSON
     */
    private async analyzeQueryWithLLM(query: string): Promise<any> {
        const prompt = `
        ${this.SCHEMA_CONTEXT}

        USER QUERY: "${query}"

        YOUR TASK:
        Analyze the query and return a strict JSON object (no markdown) with this structure:
        {
            "type": "QUERY_DATA" | "CHIT_CHAT" | "UNKNOWN",
            "entity": "asset" | "employee" | "ticket" | "unknown",
            "visualization": "table" | "stat_card" | "list" | "detail", 
            "searchTerm": "extracted search keyword or null",
            "filters": { "field": "value" }, 
            "response": "If CHIT_CHAT, write a helpful response here. If QUERY_DATA, leave null."
        }

        VISUALIZATION RULES:
        - "count", "how many", "stats", "total" -> "stat_card"
        - "list", "show all", "search", "find" -> "table" (if multiple results expected)
        - "details of", "show me [specific item]" -> "detail"
        
        EXAMPLES:
        - "Count my laptops" -> { "type": "QUERY_DATA", "entity": "asset", "visualization": "stat_card", "filters": { "model": "laptop" } }
        - "Show broken devices" -> { "type": "QUERY_DATA", "entity": "asset", "visualization": "table", "filters": { "assetStatusEnum": "MAINTENANCE" } }
        - "Who is John?" -> { "type": "QUERY_DATA", "entity": "employee", "visualization": "table", "searchTerm": "John" }
        `;

        const result = await this.model.generateContent(prompt);
        const response = result.response;
        const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(text);
        } catch (e) {
            this.logger.error("Failed to parse LLM JSON response", text);
            return { type: 'UNKNOWN', response: "I'm having trouble understanding that request right now." };
        }
    }

    /**
     * Ask Gemini to write a natural language summary of the data
     */
    private async summarizeResultsWithLLM(query: string, data: any[], vizType: string): Promise<string> {
        const dataSample = JSON.stringify(data.slice(0, 5));
        const count = data.length;

        const prompt = `
        USER QUERY: "${query}"
        VISUALIZATION MODE: ${vizType}
        DATA FOUND (${count} records): ${dataSample}

        TASK:
        Write a concise, high-level executive summary of this data.
        - Start with a clear headline e.g. "### ✅ Found 5 Matching Assets"
        - Use bullet points for key insights.
        - If vizType is 'stat_card', just state the number clearly with an emoji.
        - If vizType is 'table', summarize the commonalities (e.g. "Most are Dell laptops").
        - Tone: Professional, Helpful, Intelligent.
        `;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Execute a TypeORM query based on the AI's structured intent.
     */
    private async executeSafeQuery(entityName: string, filters: any, searchTerm: string, companyId: number): Promise<any[]> {
        let repoName = '';
        let searchFields = [];

        switch (entityName?.toLowerCase()) {
            case 'asset':
            case 'device':
                repoName = 'AssetInfoEntity';
                searchFields = ['serialNumber', 'model', 'configuration', 'osVersion', 'ipAddress'];
                break;
            case 'employee':
                repoName = 'EmployeesEntity';
                searchFields = ['firstName', 'lastName', 'email', 'designation'];
                break;
            case 'ticket':
                repoName = 'TicketsEntity';
                searchFields = ['ticketCode', 'subject', 'ticketStatus'];
                break;
            default:
                return [];
        }

        const repo = this.dataSource.getRepository(repoName);
        const qb = repo.createQueryBuilder('e').where('e.companyId = :companyId', { companyId });

        // Apply Search Term (Fuzzy Search)
        if (searchTerm) {
            const conditions = searchFields.map(field => `e.${field} LIKE :term`).join(' OR ');
            qb.andWhere(`(${conditions})`, { term: `%${searchTerm}%` });
        }

        // Apply Strict Filters (if AI extracted them)
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (/^[a-zA-Z0-9_]+$/.test(key)) {
                    qb.andWhere(`e.${key} = :${key}`, { [key]: value });
                }
            });
        }

        return await qb.limit(20).getMany();
    }

    private async executeCountQuery(entityName: string, filters: any, companyId: number): Promise<number> {
        let repoName = '';
        switch (entityName?.toLowerCase()) {
            case 'asset': repoName = 'AssetInfoEntity'; break;
            case 'employee': repoName = 'EmployeesEntity'; break;
            case 'ticket': repoName = 'TicketsEntity'; break;
            default: return 0;
        }

        const repo = this.dataSource.getRepository(repoName);
        const qb = repo.createQueryBuilder('e').where('e.companyId = :companyId', { companyId });

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (/^[a-zA-Z0-9_]+$/.test(key)) {
                    qb.andWhere(`e.${key} = :${key}`, { [key]: value });
                }
            });
        }

        return await qb.getCount();
    }


    /**
     * OPTION B: Heuristic/Regex Fallback (The "Old Brain")
     */
    private async processWithHeuristics(query: string, companyId: number): Promise<AiQueryResponse> {
        const cleanQuery = query.toLowerCase().trim();

        // 1. SIMPLE INTENT DETECTION: COUNT (Stat Card)
        if (cleanQuery.includes('count') || cleanQuery.includes('how many') || cleanQuery.includes('total')) {
            if (cleanQuery.includes('asset') || cleanQuery.includes('device')) {
                const count = await this.dataSource.getRepository(AssetInfoEntity).count({ where: { companyId } });
                return new AiQueryResponse(true, 200, "Count", `### 📊 Asset Statistics\n\n**Total Assets:** ${count}`, 'stat_card', 'asset', [{ count, label: 'Total Assets' }]);
            }
            if (cleanQuery.includes('employee') || cleanQuery.includes('user')) {
                const count = await this.dataSource.getRepository('EmployeesEntity').count({ where: { companyId } });
                return new AiQueryResponse(true, 200, "Count", `### 👤 Employee Statistics\n\n**Total Employees:** ${count}`, 'stat_card', 'employee', [{ count, label: 'Total Employees' }]);
            }
            if (cleanQuery.includes('ticket')) {
                const count = await this.dataSource.getRepository('TicketsEntity').count({ where: { companyId } });
                return new AiQueryResponse(true, 200, "Count", `### 🎫 Ticket Statistics\n\n**Total Tickets:** ${count}`, 'stat_card', 'ticket', [{ count, label: 'Total Tickets' }]);
            }
        }

        // 2. KEYWORD SEARCH (Table View)
        let results = [];
        let entity = 'none';

        if (cleanQuery.includes('asset') || cleanQuery.includes('device') || cleanQuery.includes('laptop')) {
            entity = 'asset';
            const term = cleanQuery.replace(/asset|device|laptop|search|find|show/gi, '').trim();
            results = await this.dataSource.getRepository(AssetInfoEntity).find({
                where: term ? [{ model: Like(`%${term}%`), companyId }, { serialNumber: Like(`%${term}%`), companyId }] : { companyId },
                take: 10
            });
        }
        else if (cleanQuery.includes('employee') || cleanQuery.includes('user')) {
            entity = 'employee';
            const term = cleanQuery.replace(/employee|user|staff|search|find|show/gi, '').trim();
            results = await this.dataSource.getRepository('EmployeesEntity').find({
                where: term ? [{ firstName: Like(`%${term}%`), companyId }, { email: Like(`%${term}%`), companyId }] : { companyId },
                take: 10
            });
        }
        else if (cleanQuery.includes('ticket')) {
            entity = 'ticket';
            const term = cleanQuery.replace(/ticket|issue|search|find|show/gi, '').trim();
            results = await this.dataSource.getRepository('TicketsEntity').find({
                where: term ? [{ ticketCode: Like(`%${term}%`), companyId }, { subject: Like(`%${term}%`), companyId }] : { companyId },
                take: 10
            });
        }

        if (results.length > 0) {
            return new AiQueryResponse(true, 200, "Success", `### Found ${results.length} ${this.capitalize(entity)}s`, 'table', entity, results);
        }

        // Fallback Default
        const assets = await this.dataSource.getRepository(AssetInfoEntity).find({ where: { companyId }, take: 5, order: { id: 'DESC' } as any });
        return new AiQueryResponse(true, 200, "List", "### 💻 Latest Assets", 'table', 'asset', assets);
    }

    private capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
}
