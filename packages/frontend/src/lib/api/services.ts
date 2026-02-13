import { AuthUsersService, AdministrationService, EmployeesService, AssetInfoService, AssetTabsService, TicketsService, LicensesService, ReportsService, DashboardService, DocumentsService, CompanyService, WorkflowService, KnowledgeBaseService, ProcurementService, DepartmentService, AssetTypeService, BrandService, VendorService, ApplicationService, SlackUserService, NetworkService } from '@adminvault/shared-services';

export const authService = new AuthUsersService();
export const administrationService = new AdministrationService();
export const employeeService = new EmployeesService();
export const assetService = new AssetInfoService();
export const assetTabsService = new AssetTabsService();
export const ticketService = new TicketsService();
export const departmentService = new DepartmentService();
export const assetTypeService = new AssetTypeService();
export const brandService = new BrandService();
export const vendorService = new VendorService();
export const applicationService = new ApplicationService();
export const slackUserService = new SlackUserService();

export const dashboardService = new DashboardService();
export const licensesService = new LicensesService();
export const reportsService = new ReportsService();
export const documentsService = new DocumentsService();
export const companyService = new CompanyService();
export const emailService = administrationService;
export const workflowService = new WorkflowService();
export const kbService = new KnowledgeBaseService();
export const procurementService = new ProcurementService();
export const networkService = new NetworkService();

export const services = {
    auth: authService,
    administration: administrationService,
    asset: assetService,
    assetTabs: assetTabsService,
    ticket: ticketService,
    department: departmentService,
    assetType: assetTypeService,
    brand: brandService,
    vendor: vendorService,
    application: applicationService,
    slackUser: slackUserService,

    licenses: licensesService,
    reports: reportsService,
    documents: documentsService,
    company: companyService,
    email: emailService,
    workflow: workflowService,
    kb: kbService,
    procurement: procurementService,
    network: networkService,
};
