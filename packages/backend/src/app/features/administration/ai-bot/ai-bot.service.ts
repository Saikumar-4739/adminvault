import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Like } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiQueryResponse } from '@adminvault/shared-models';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Entities
import { AssetInfoEntity } from '../../asset-info/entities/asset-info.entity';
import { EmployeesEntity } from '../../employees/entities/employees.entity';
import { TicketsEntity } from '../../tickets/entities/tickets.entity';
import { DepartmentsMasterEntity } from '../../masters/department/entities/department.entity';
import { LocationsMasterEntity } from '../../masters/location/entities/location.entity';
import { VendorsMasterEntity } from '../../masters/vendor/entities/vendor.entity';
import { PurchaseOrderEntity } from '../../procurement/entities/purchase-order.entity';
import { DocumentEntity } from '../../documents/entities/document.entity';

@Injectable()
export class AiBotService {
    private readonly logger = new Logger(AiBotService.name);
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;
    private hasApiKey = false;

    // 🧠 KNOWLEDGE GRAPH: Database Schema Definition for the AI
    private readonly SCHEMA_CONTEXT = `
    You are AdminVault AI, an advanced enterprise administrator assistant.
    
    SYSTEM CAPABILITIES:
    - You have direct access to "Assets", "Employees", "Tickets", "Departments", "Locations", "Vendors", "Purchase Orders", and "Documents" databases.
    - User Query -> You Analyze Intent -> You Decide Best Visualization -> You Return Data.

    AVAILABLE DATA ENTITIES:

    1. ASSETS (Repository: AssetInfoEntity)
       - Keywords: asset, device, laptop, macbook, monitor, equipment, machine, computer
       - Fields: serialNumber (unique id), model, assetStatusEnum (AVAILABLE, IN_USE, MAINTENANCE, RETIRED), complianceStatus, batteryLevel, storageAvailable, osVersion, ipAddress, lastSync

    2. EMPLOYEES (Repository: EmployeesEntity)
       - Keywords: employee, user, staff, person, worker, team member
       - Fields: firstName, lastName, email, designation, departmentId, phoneNumber

    3. TICKETS (Repository: TicketsEntity)
       - Keywords: ticket, issue, support, help, request, complaint, bug
       - Fields: ticketCode, subject, priorityEnum, ticketStatus (OPEN, CLOSED), categoryEnum

    4. DEPARTMENTS (Repository: DepartmentsMasterEntity)
       - Keywords: department, team, unit, division, group
       - Fields: name, code, description, isActive

    5. LOCATIONS (Repository: LocationsMasterEntity)
       - Keywords: location, office, branch, site, building, address
       - Fields: name, city, country, address, isActive

    6. VENDORS (Repository: VendorsMasterEntity)
       - Keywords: vendor, supplier, provider, contractor, partner
       - Fields: name, contactPerson, email, phone, code

    7. PURCHASE ORDERS (Repository: PurchaseOrderEntity)
       - Keywords: po, purchase order, procurement, order, buying
       - Fields: poNumber, status (DRAFT, APPROVED, ORDERED, RECEIVED), totalAmount, orderDate, vendorId

    8. DOCUMENTS (Repository: DocumentEntity)
       - Keywords: document, file, attachment, pdf, report, contract
       - Fields: originalName, category, tags, fileSize, mimeType, uploadedBy
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
        const analysis = await this.analyzeQueryWithLLM(query);

        if (analysis.type === 'CHIT_CHAT' || analysis.type === 'UNKNOWN') {
            return new AiQueryResponse(true, 200, "Response", analysis.response, 'chat', 'none');
        }

        let results = [];
        let entity = 'none';

        if (analysis.type === 'QUERY_DATA') {
            entity = analysis.entity;
            if (analysis.visualization == 'stat_card') {
                const count = await this.executeCountQuery(analysis.entity, analysis.filters, companyId);
                results = [{ count, label: `Total ${this.capitalize(analysis.entity)}s` }];
            } else {
                results = await this.executeSafeQuery(analysis.entity, analysis.filters, analysis.searchTerm, companyId);
            }
        }

        if (results.length > 0) {
            const summary = await this.summarizeResultsWithLLM(query, results, analysis.visualization);
            return new AiQueryResponse(true, 200, "Success", summary, analysis.visualization, entity, results);
        } else {
            return new AiQueryResponse(true, 200, "No Data", `I understood you are looking for **${analysis.entity}** related to "${analysis.searchTerm || query}", but I couldn't find any matching records.`, 'search', entity);
        }
    }

    private async analyzeQueryWithLLM(query: string): Promise<any> {
        const prompt = `
        ${this.SCHEMA_CONTEXT}

        USER QUERY: "${query}"

        YOUR TASK:
        Analyze the query and return a strict JSON object (no markdown) with this structure:
        {
            "type": "QUERY_DATA" | "CHIT_CHAT" | "UNKNOWN",
            "entity": "asset" | "employee" | "ticket" | "department" | "location" | "vendor" | "purchase_order" | "document",
            "visualization": "table" | "stat_card" | "list" | "detail", 
            "searchTerm": "extracted search keyword or null",
            "filters": { "field": "value" }, 
            "response": "If CHIT_CHAT, write a helpful response here. If QUERY_DATA, leave null."
        }

        VISUALIZATION RULES:
        - "count", "how many", "stats", "total" -> "stat_card"
        - "list", "show all", "search", "find" -> "table" (if multiple results expected)
        - "details of", "show me [specific item]" -> "detail"
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
        - Tone: Professional, Helpful, Intelligent.
        `;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    private async executeSafeQuery(entityName: string, filters: any, searchTerm: string, companyId: number): Promise<any[]> {
        let repo: any;
        let searchFields = [];

        switch (entityName?.toLowerCase()) {
            case 'asset':
            case 'device':
                repo = this.dataSource.getRepository(AssetInfoEntity);
                searchFields = ['model', 'serialNumber', 'osVersion', 'ipAddress'];
                break;
            case 'employee':
                repo = this.dataSource.getRepository(EmployeesEntity);
                searchFields = ['firstName', 'lastName', 'email', 'designation'];
                break;
            case 'ticket':
                repo = this.dataSource.getRepository(TicketsEntity);
                searchFields = ['ticketCode', 'subject', 'priorityEnum'];
                break;
            case 'department':
                repo = this.dataSource.getRepository(DepartmentsMasterEntity);
                searchFields = ['name', 'code', 'description'];
                break;
            case 'location':
                repo = this.dataSource.getRepository(LocationsMasterEntity);
                searchFields = ['name', 'city', 'country', 'address'];
                break;
            case 'vendor':
                repo = this.dataSource.getRepository(VendorsMasterEntity);
                searchFields = ['name', 'email', 'contactPerson', 'code'];
                break;
            case 'purchase_order':
                repo = this.dataSource.getRepository(PurchaseOrderEntity);
                searchFields = ['poNumber', 'status'];
                break;
            case 'document':
                repo = this.dataSource.getRepository(DocumentEntity);
                searchFields = ['originalName', 'category', 'tags'];
                break;
            default:
                return [];
        }

        const qb = repo.createQueryBuilder('e');

        // Handle Base Entity Differences (MasterBaseEntity vs CommonBaseEntity vs others)
        // Most have companyId, but some might name it differently or rely on tenancy.
        // Assuming standard 'companyId' column exists on all accessible entities.
        qb.where('e.companyId = :companyId', { companyId });

        if (searchTerm) {
            const conditions = searchFields.map(field => `e.${field} LIKE :term`).join(' OR ');
            qb.andWhere(`(${conditions})`, { term: `%${searchTerm}%` });
        }

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
        let repo: any;
        switch (entityName?.toLowerCase()) {
            case 'asset': repo = this.dataSource.getRepository(AssetInfoEntity); break;
            case 'employee': repo = this.dataSource.getRepository(EmployeesEntity); break;
            case 'ticket': repo = this.dataSource.getRepository(TicketsEntity); break;
            case 'department': repo = this.dataSource.getRepository(DepartmentsMasterEntity); break;
            case 'location': repo = this.dataSource.getRepository(LocationsMasterEntity); break;
            case 'vendor': repo = this.dataSource.getRepository(VendorsMasterEntity); break;
            case 'purchase_order': repo = this.dataSource.getRepository(PurchaseOrderEntity); break;
            case 'document': repo = this.dataSource.getRepository(DocumentEntity); break;
            default: return 0;
        }

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

    private async processWithHeuristics(query: string, companyId: number): Promise<AiQueryResponse> {
        const cleanQuery = query.toLowerCase().trim();
        let entity = 'none';
        let repo: any;
        let searchFields = [];

        // 1. Determine Entity
        if (cleanQuery.includes('asset') || cleanQuery.includes('device')) {
            entity = 'asset';
            repo = this.dataSource.getRepository(AssetInfoEntity);
            searchFields = ['model', 'serialNumber'];
        } else if (cleanQuery.includes('employee') || cleanQuery.includes('user')) {
            entity = 'employee';
            repo = this.dataSource.getRepository(EmployeesEntity);
            searchFields = ['firstName', 'lastName', 'email'];
        } else if (cleanQuery.includes('ticket')) {
            entity = 'ticket';
            repo = this.dataSource.getRepository(TicketsEntity);
            searchFields = ['subject', 'ticketCode'];
        } else if (cleanQuery.includes('department')) {
            entity = 'department';
            repo = this.dataSource.getRepository(DepartmentsMasterEntity);
            searchFields = ['name'];
        } else if (cleanQuery.includes('location')) {
            entity = 'location';
            repo = this.dataSource.getRepository(LocationsMasterEntity);
            searchFields = ['name', 'city'];
        } else if (cleanQuery.includes('vendor')) {
            entity = 'vendor';
            repo = this.dataSource.getRepository(VendorsMasterEntity);
            searchFields = ['name'];
        } else if (cleanQuery.includes('purchase order') || cleanQuery.includes(' po ')) {
            entity = 'purchase_order';
            repo = this.dataSource.getRepository(PurchaseOrderEntity);
            searchFields = ['poNumber'];
        }

        if (!repo) {
            return new AiQueryResponse(true, 200, "Welcome", "I can help you find Assets, Employees, Tickets, Departments, Locations, Vendors, and Purchase Orders. Try asking 'Show me all laptops' or 'Count open tickets'.", 'chat', 'none');
        }

        // 2. Count Check
        if (cleanQuery.includes('count') || cleanQuery.includes('how many') || cleanQuery.includes('total')) {
            const count = await repo.count({ where: { companyId } });
            return new AiQueryResponse(true, 200, "Count", `### Statistics\n\n**Total ${this.capitalize(entity)}s:** ${count}`, 'stat_card', entity, [{ count, label: `Total ${this.capitalize(entity)}s` }]);
        }

        // 3. Simple Search
        // Remove keywords to isolate search term
        const term = cleanQuery.replace(new RegExp(`${entity}|search|find|show|list|all|my`, 'gi'), '').trim();

        let qb = repo.createQueryBuilder('e').where('e.companyId = :companyId', { companyId });

        if (term) {
            const conditions = searchFields.map(field => `e.${field} LIKE :term`).join(' OR ');
            qb.andWhere(`(${conditions})`, { term: `%${term}%` });
        }

        const results = await qb.take(10).getMany();

        if (results.length > 0) {
            return new AiQueryResponse(true, 200, "Success", `### Found ${results.length} ${this.capitalize(entity)}s`, 'table', entity, results);
        } else {
            return new AiQueryResponse(true, 200, "No Data", `No ${entity}s found matching "${term}".`, 'search', entity);
        }
    }

    private capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
}
