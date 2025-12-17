// Initialize all API services as singletons
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

// Export all services
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
};
