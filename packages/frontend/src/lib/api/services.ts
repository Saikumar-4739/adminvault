import {
    AuthUserHelperService,
    CompanyInfoService,
    EmployeesService,
    AssetInfoService,
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
    DashboardService
} from '@adminvault/shared-services';

// Create singleton instances
export const authService = new AuthUserHelperService();
export const companyService = new CompanyInfoService();
export const employeeService = new EmployeesService();
export const assetService = new AssetInfoService();
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

export const services = {
    auth: authService,
    company: companyService,
    employee: employeeService,
    asset: assetService,
    device: deviceService,
    email: emailService,
    ticket: ticketService,
    assetAssign: assetAssignService,
    itAdmin: itAdminService,
    masters: mastersService,
    ticketCategory: ticketCategoryService,
    licenses: licensesService,
    emailAccounts: emailAccountsService,
    reports: reportsService
};
