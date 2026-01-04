import {
    AuthUserHelperService,
    CompanyInfoService,
    EmployeesService,
    AssetInfoService,
    TicketsService,
    DashboardService,
    DocumentsService
} from '@adminvault/shared-services';

// Create singleton instances
export const authService = new AuthUserHelperService();
export const companyService = new CompanyInfoService();
export const employeeService = new EmployeesService();
export const assetService = new AssetInfoService();
export const ticketService = new TicketsService();
export const dashboardService = new DashboardService();
export const documentsService = new DocumentsService();
