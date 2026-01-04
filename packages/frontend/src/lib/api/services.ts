import {
    AuthUserHelperService,
    CompanyInfoService,
    EmployeesService,
    AssetInfoService,
    AssetTabsService,
    DeviceInfoService,
    EmailInfoService,
    TicketsService,
    AssetAssignService,
    ItAdminService,
    MastersService,
    TicketCategoryService,
    LicensesService,
    EmailAccountsService,
    ReportsService,
    DashboardService,
    SlackUsersService,
    DocumentsService,
    AuditLogsService,
    IAMService,
    PasswordVaultService,
    SupportService,
    SettingsService
} from '@adminvault/shared-services';

// Create singleton instances
export const authService = new AuthUserHelperService();
export const companyService = new CompanyInfoService();
export const employeeService = new EmployeesService();
export const assetService = new AssetInfoService();
export const assetTabsService = new AssetTabsService();
export const deviceService = new DeviceInfoService();
export const emailService = new EmailInfoService();
export const ticketService = new TicketsService();
export const assetAssignService = new AssetAssignService();
export const itAdminService = new ItAdminService();
export const mastersService = new MastersService();
export const dashboardService = new DashboardService();
export const ticketCategoryService = new TicketCategoryService();
export const licensesService = new LicensesService();
export const emailAccountsService = new EmailAccountsService();
export const reportsService = new ReportsService();
export const slackUsersService = new SlackUsersService();
export const documentsService = new DocumentsService();
export const auditLogsService = new AuditLogsService();
export const iamService = new IAMService();

export const services = {
    auth: authService,
    company: companyService,
    employee: employeeService,
    asset: assetService,
    assetTabs: assetTabsService,
    device: deviceService,
    email: emailService,
    ticket: ticketService,
    assetAssign: assetAssignService,
    itAdmin: itAdminService,
    masters: mastersService,
    ticketCategory: ticketCategoryService,
    licenses: licensesService,
    emailAccounts: emailAccountsService,
    reports: reportsService,
    slackUsers: slackUsersService,
    documents: documentsService,
    auditLogs: auditLogsService,
    iam: iamService
};
