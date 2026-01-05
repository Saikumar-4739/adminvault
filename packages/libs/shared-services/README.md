# @adminvault/shared-services

Shared services library for AdminVault application providing API service classes for frontend-backend communication.

## Features

- 🔧 **Base HTTP Service** - Common axios service with all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- 🔐 **Authentication** - User registration, login, logout, and management
- 🏢 **Company Management** - CRUD operations for companies
- 👥 **Employee Management** - CRUD operations for employees
- 💼 **Asset Management** - CRUD operations for assets
- 📱 **Device Management** - CRUD operations for devices
- 📧 **Email Management** - CRUD operations for email information
- 🎫 **Ticket Management** - CRUD operations for support tickets
- 🔗 **Asset Assignment** - Manage asset-to-employee assignments
- 👨‍💼 **IT Admin Management** - CRUD operations for IT administrators

## Installation

This package is part of the AdminVault monorepo and is automatically available to other packages.

```bash
yarn install
```

## Configuration

The services use environment variables for configuration. Set these in your environment or `window._env_` object:

- `APP_AVS_SERVICE_URL` - Backend API URL (default: `https://adminvault.onrender.com`)
- `APP_RETRY_CODES` - Network error codes to retry (default: `ECONNABORTED,ETIMEDOUT,ENOTFOUND`)
- `APP_REQ_RETRY_STATUS_CODES` - HTTP status codes to retry (default: `408,429,500,502,503,504`)
- `APP_REQ_RETRY_MAX_ATTEMPTS` - Maximum retry attempts (default: `3`)
- `APP_REQ_RETRY_DELAY` - Delay between retries in ms (default: `1000`)

## Usage

### Authentication Service

```typescript
import { AuthUserHelperService } from '@adminvault/shared-services';

const authService = new AuthUserHelperService();

// Register a new user
const registerResponse = await authService.registerUser({
  companyId: 1,
  email: 'user@example.com',
  password: 'password123',
  // ... other fields
});

// Login
const loginResponse = await authService.loginUser({
  email: 'user@example.com',
  password: 'password123'
});

// Logout
await authService.logOutUser({ userId: 123 });

// Update user
await authService.updateUser({ userId: 123, /* ... */ });

// Delete user
await authService.deleteUser({ userId: 123 });

// Get all users
const users = await authService.getAllUsers({ companyId: 1 });
```

### Company Service

```typescript
import { CompanyInfoService } from '@adminvault/shared-services';

const companyService = new CompanyInfoService();

// Create company
await companyService.createCompany({
  name: 'Acme Corp',
  // ... other fields
});

// Update company
await companyService.updateCompany({ companyId: 1, /* ... */ });

// Get company
const company = await companyService.getCompany({ companyId: 1 });

// Get all companies
const companies = await companyService.getAllCompanies();

// Delete company
await companyService.deleteCompany({ companyId: 1 });
```

### Employee Service

```typescript
import { EmployeesService } from '@adminvault/shared-services';

const employeeService = new EmployeesService();

// Create employee
await employeeService.createEmployee({
  companyId: 1,
  name: 'John Doe',
  // ... other fields
});

// Update employee
await employeeService.updateEmployee({ employeeId: 1, /* ... */ });

// Get employee
const employee = await employeeService.getEmployee({ employeeId: 1 });

// Get all employees (optionally filter by company)
const allEmployees = await employeeService.getAllEmployees();
const companyEmployees = await employeeService.getAllEmployees(1);

// Delete employee
await employeeService.deleteEmployee({ employeeId: 1 });
```

### Asset Service

```typescript
import { AssetInfoService } from '@adminvault/shared-services';

const assetService = new AssetInfoService();

// Create asset
await assetService.createAsset({
  companyId: 1,
  assetName: 'Laptop',
  // ... other fields
});

// Update asset
await assetService.updateAsset({ assetId: 1, /* ... */ });

// Get asset
const asset = await assetService.getAsset({ assetId: 1 });

// Get all assets (optionally filter by company)
const assets = await assetService.getAllAssets(1);

// Delete asset
await assetService.deleteAsset({ assetId: 1 });
```

### Device Service

```typescript
import { DeviceInfoService } from '@adminvault/shared-services';

const deviceService = new DeviceInfoService();

// CRUD operations similar to Asset Service
await deviceService.createDevice({ /* ... */ });
await deviceService.updateDevice({ /* ... */ });
const device = await deviceService.getDevice({ deviceId: 1 });
const devices = await deviceService.getAllDevices();
await deviceService.deleteDevice({ deviceId: 1 });
```

### Email Service

```typescript
import { EmailInfoService } from '@adminvault/shared-services';

const emailService = new EmailInfoService();

// CRUD operations
await emailService.createEmailInfo({ /* ... */ });
await emailService.updateEmailInfo({ /* ... */ });
const email = await emailService.getEmailInfo({ emailId: 1 });
const emails = await emailService.getAllEmailInfo(1); // Optional companyId
await emailService.deleteEmailInfo({ emailId: 1 });
```

### Ticket Service

```typescript
import { TicketsService } from '@adminvault/shared-services';

const ticketService = new TicketsService();

// CRUD operations
await ticketService.createTicket({ /* ... */ });
await ticketService.updateTicket({ /* ... */ });
const ticket = await ticketService.getTicket({ ticketId: 1 });
const tickets = await ticketService.getAllTickets();
await ticketService.deleteTicket({ ticketId: 1 });
```

### Asset Assignment Service

```typescript
import { AssetAssignService } from '@adminvault/shared-services';

const assignService = new AssetAssignService();

// Assign asset to employee
await assignService.createAssignment({
  assetId: 1,
  employeeId: 1,
  // ... other fields
});

// Update assignment
await assignService.updateAssignment({ assignmentId: 1, /* ... */ });

// Get assignment
const assignment = await assignService.getAssignment({ assignmentId: 1 });

// Get all assignments
const assignments = await assignService.getAllAssignments();

// Delete assignment
await assignService.deleteAssignment({ assignmentId: 1 });
```

### IT Admin Service

```typescript
import { ItAdminService } from '@adminvault/shared-services';

const adminService = new ItAdminService();

// CRUD operations
await adminService.createAdmin({ /* ... */ });
await adminService.updateAdmin({ /* ... */ });
const admin = await adminService.getAdmin({ adminId: 1 });
const admins = await adminService.getAllAdmins();
await adminService.deleteAdmin({ adminId: 1 });
```

## Custom Configuration

All service methods accept an optional `AxiosRequestConfig` parameter for custom headers, timeout, etc:

```typescript
const response = await authService.loginUser(
  { email: 'user@example.com', password: 'password123' },
  {
    headers: { 'Custom-Header': 'value' },
    timeout: 5000
  }
);
```

## Error Handling

All services throw errors with descriptive messages. Wrap calls in try-catch blocks:

```typescript
try {
  const user = await authService.loginUser(credentials);
  console.log('Login successful:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

## Architecture

```
CommonAxiosService (Base Class)
├── Configuration from environment
├── HTTP Methods: POST, GET, PUT, PATCH, DELETE
├── Centralized response handling
├── Centralized error handling
└── Automatic retry logic

Feature Services (extend CommonAxiosService)
├── AuthUserHelperService
├── CompanyInfoService
├── EmployeesService
├── AssetInfoService
├── DeviceInfoService
├── EmailInfoService
├── TicketsService
├── AssetAssignService
└── ItAdminService
```

## Development

The services are built using TypeScript and use models from `@adminvault/shared-models` for type safety.

### Building

```bash
yarn build
```

### Type Checking

```bash
yarn type-check
```

## License

Private - AdminVault Internal Use Only
