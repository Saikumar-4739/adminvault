import { AuthUsersService, AdministrationService, EmployeesService, AssetInfoService, AssetTabsService, TicketsService, MastersService, LicensesService, ReportsService, DashboardService, DocumentsService, CompanyService, WorkflowService, AiService, KnowledgeBaseService, ProcurementService, MaintenanceService, DepartmentService, AssetTypeService, BrandService, VendorService, ApplicationService, TicketCategoryService, LocationService, SlackUserService, PasswordVaultService, DeviceInfoService, ExpenseCategoryService } from '@adminvault/shared-services';

export const authService = new AuthUsersService();
export const administrationService = new AdministrationService();
export const employeeService = new EmployeesService();
export const assetService = new AssetInfoService();
export const assetTabsService = new AssetTabsService();
export const ticketService = new TicketsService();
export const mastersService = new MastersService();
export const departmentService = new DepartmentService();
export const assetTypeService = new AssetTypeService();
export const brandService = new BrandService();
export const vendorService = new VendorService();
export const applicationService = new ApplicationService();
export const ticketCategoryService = new TicketCategoryService();
export const locationService = new LocationService();
export const slackUserService = new SlackUserService();
export const passwordVaultService = new PasswordVaultService();
export const deviceInfoService = new DeviceInfoService();
export const expenseCategoryService = new ExpenseCategoryService();
export const dashboardService = new DashboardService();
export const licensesService = new LicensesService();
export const reportsService = new ReportsService();
export const documentsService = new DocumentsService();
export const companyService = new CompanyService();
export const emailService = administrationService;
export const iamService = administrationService;
export const workflowService = new WorkflowService();
export const aiService = new AiService();
export const kbService = new KnowledgeBaseService();
export const procurementService = new ProcurementService();
export const maintenanceService = new MaintenanceService();

export const services = {
    auth: authService,
    administration: administrationService,
    employee: employeeService,
    asset: assetService,
    assetTabs: assetTabsService,
    ticket: ticketService,
    masters: mastersService,
    department: departmentService,
    assetType: assetTypeService,
    brand: brandService,
    vendor: vendorService,
    application: applicationService,
    ticketCategory: ticketCategoryService,
    location: locationService,
    slackUser: slackUserService,
    passwordVault: passwordVaultService,
    deviceInfo: deviceInfoService,
    expenseCategory: expenseCategoryService,
    licenses: licensesService,
    reports: reportsService,
    documents: documentsService,
    company: companyService,
    email: emailService,
    iam: iamService,
    workflow: workflowService,
    ai: aiService,
    kb: kbService,
    procurement: procurementService,
    maintenance: maintenanceService
};
