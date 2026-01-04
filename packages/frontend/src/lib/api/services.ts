import {
    AuthUsersService,
    AdministrationService,
    EmployeesService,
    AssetInfoService,
    AssetTabsService,
    TicketsService,
    MastersService,
    LicensesService,
    ReportsService,
    DashboardService,
    DocumentsService
} from '@adminvault/shared-services';

// Create singleton instances
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

// Aliases for compatibility/migration (if needed) or distinct logical groupings
// You should prefer using the specific services above.
export const services = {
    auth: authService,
    administration: administrationService,
    employee: employeeService,
    asset: assetService,
    assetTabs: assetTabsService,
    ticket: ticketService,
    masters: mastersService,
    licenses: licensesService,
    reports: reportsService,
    documents: documentsService
};
