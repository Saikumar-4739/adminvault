import { AuthUsersService, AdministrationService, EmployeesService, AssetInfoService, AssetTabsService, TicketsService, MastersService, LicensesService, ReportsService, DashboardService, DocumentsService, CompanyService, WorkflowService, AiService, KnowledgeBaseService, ProcurementService, MaintenanceService } from '@adminvault/shared-services';

export const authService = new AuthUsersService();
export const administrationService = new AdministrationService();
export const employeeService = new EmployeesService();
export const assetService = new AssetInfoService();
export const assetTabsService = new AssetTabsService();
export const ticketService = new TicketsService();
export const mastersService = new MastersService();
export const dashboardService = new DashboardService();
export const licensesService = new LicensesService();
export const reportsService = new ReportsService();
export const documentsService = new DocumentsService();
export const companyService = new CompanyService();
export const emailService = administrationService; // Email operations are handled by administration service
export const iamService = administrationService;
export const workflowService = new WorkflowService();
export const aiService = new AiService();
export const kbService = new KnowledgeBaseService();
export const procurementService = new ProcurementService();
export const maintenanceService = new MaintenanceService();

export const services = { auth: authService, administration: administrationService, employee: employeeService, asset: assetService, assetTabs: assetTabsService, ticket: ticketService, masters: mastersService, licenses: licensesService, reports: reportsService, documents: documentsService, company: companyService, email: emailService, iam: iamService, workflow: workflowService, ai: aiService, kb: kbService, procurement: procurementService, maintenance: maintenanceService };
