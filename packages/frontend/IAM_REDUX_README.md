# IAM & SSO Page - Redux Implementation

## Overview
The IAM (Identity & Access Management) page has been completely refactored to use **Redux Toolkit** for state management with full **TypeScript** support. The page displays all employees/users in a beautiful, optimized interface.

## 🎯 Features

### 1. **All Users Display**
- Shows **all employees** from the company in a clean card grid layout
- Each card displays:
  - Avatar with initials and department-based color coding
  - Full name and department
  - Email and phone number
  - Join date
  - Active/Inactive status with visual indicators
- Real-time search across name, email, department, and phone
- Responsive grid layout (1-4 columns based on screen size)

### 2. **SSO Providers Management**
- Create, edit, and delete SSO providers
- Support for SAML, OAuth, and OIDC
- Visual status indicators
- Complete provider configuration

### 3. **Roles & Permissions**
- Create and manage custom roles
- System roles protection (cannot be deleted)
- Permission count display
- Role descriptions

## 🏗️ Architecture

### Redux Store Structure
```
store/
├── index.ts              # Store configuration
├── hooks.ts              # Typed Redux hooks
└── slices/
    ├── employeesSlice.ts # Employee state management
    └── iamSlice.ts       # IAM state management
```

### State Management

#### Employees Slice
```typescript
interface EmployeesState {
    employees: Employee[];
    filteredEmployees: Employee[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    selectedCompanyId: number | null;
}
```

**Actions:**
- `fetchEmployees` - Fetch all employees
- `createEmployee` - Create new employee
- `updateEmployee` - Update employee
- `deleteEmployee` - Delete employee
- `setSearchQuery` - Filter employees by search

**Selectors:**
- `selectEmployees` - All employees
- `selectFilteredEmployees` - Filtered employees
- `selectEmployeeStats` - Computed stats (total, active, inactive, new)

#### IAM Slice
```typescript
interface IAMState {
    users: IAMUser[];
    ssoProviders: SSOProvider[];
    roles: Role[];
    isLoading: boolean;
    error: string | null;
    activeTab: 'users' | 'sso' | 'roles';
}
```

**Actions:**
- User Management: `fetchUsers`, `updateUser`, `deleteUser`
- SSO: `fetchSSOProviders`, `createSSOProvider`, `updateSSOProvider`, `deleteSSOProvider`
- Roles: `fetchRoles`, `createRole`, `updateRole`, `deleteRole`

## 📦 Installation

### Required Dependencies
```bash
npm install @reduxjs/toolkit react-redux
```

### Files Created
1. **Redux Store**
   - `src/store/index.ts` - Store configuration
   - `src/store/hooks.ts` - Typed hooks
   - `src/store/slices/employeesSlice.ts` - Employees state
   - `src/store/slices/iamSlice.ts` - IAM state

2. **Provider**
   - `src/components/providers/ReduxProvider.tsx` - Redux Provider wrapper

3. **IAM Service**
   - `packages/libs/shared-services/src/iam/iam-service.ts` - IAM API service
   - Updated `packages/frontend/src/lib/api/services.ts` - Service exports

4. **Page**
   - `src/app/iam/page.tsx` - Main IAM page with Redux

## 🚀 Usage

### Using Redux Hooks
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEmployees, selectFilteredEmployees } from '@/store/slices/employeesSlice';

function MyComponent() {
    const dispatch = useAppDispatch();
    const employees = useAppSelector(selectFilteredEmployees);
    
    useEffect(() => {
        dispatch(fetchEmployees(companyId));
    }, [dispatch, companyId]);
    
    return <div>{employees.length} employees</div>;
}
```

### Dispatching Actions
```typescript
// Fetch data
dispatch(fetchEmployees(companyId));
dispatch(fetchUsers(companyId));
dispatch(fetchSSOProviders());

// Create/Update/Delete
const result = await dispatch(createEmployee(data)).unwrap();
const result = await dispatch(updateSSOProvider({ id, data })).unwrap();
const result = await dispatch(deleteRole(id)).unwrap();
```

### Using Selectors
```typescript
// Basic selectors
const employees = useAppSelector(selectFilteredEmployees);
const users = useAppSelector(selectUsers);
const roles = useAppSelector(selectRoles);

// Computed selectors
const stats = useAppSelector(selectEmployeeStats);
// Returns: { total, active, inactive, newThisMonth }
```

## ⚡ Performance Optimizations

### 1. **Memoization**
- All callback functions use `useCallback`
- Computed values use `useMemo`
- Redux selectors are memoized

### 2. **Efficient Filtering**
- Client-side search filtering in Redux
- Debounced search (can be added)
- Filtered results cached in state

### 3. **Optimized Renders**
- Component-level memoization
- Selective Redux subscriptions
- Minimal re-renders

### 4. **TypeScript Benefits**
- Full type safety
- IntelliSense support
- Compile-time error checking
- Better refactoring

## 🎨 UI Features

### Card Grid Layout
- Responsive 1-4 column grid
- Hover effects with shadow and border
- Department-based avatar colors
- Status indicators (active/inactive)

### Search Functionality
- Real-time filtering
- Searches: name, email, department, phone
- Visual search icon
- Clear placeholder text

### Stats Display
- Total users count
- Active users count
- Prominent header display

## 🔧 TypeScript Types

### Employee Type
```typescript
interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phNumber?: string;
    companyId: number;
    departmentId: number;
    departmentName?: string;
    empStatus: 'Active' | 'Inactive';
    billingAmount?: number;
    remarks?: string;
    createdAt?: string;
    updatedAt?: string;
}
```

### IAM Types
```typescript
interface IAMUser {
    id: number;
    fullName: string;
    email: string;
    companyId: number;
    userRole: string;
    status: boolean;
    lastLogin?: Date;
    roles?: any[];
}

interface SSOProvider {
    id: number;
    name: string;
    type: 'SAML' | 'OAuth' | 'OIDC';
    clientId: string;
    isActive: boolean;
    // ... more fields
}

interface Role {
    id: number;
    name: string;
    code: string;
    description?: string;
    isSystemRole: boolean;
    permissions?: any[];
}
```

## 📝 Best Practices

1. **Always use typed hooks**: `useAppDispatch` and `useAppSelector`
2. **Handle async actions properly**: Use `.unwrap()` for error handling
3. **Use selectors**: Don't access state directly
4. **Memoize callbacks**: Use `useCallback` for event handlers
5. **Type everything**: Full TypeScript coverage

## 🐛 Error Handling

All async actions include proper error handling:
```typescript
try {
    const result = await dispatch(createEmployee(data)).unwrap();
    if (result.success) {
        success('Success', result.message);
    }
} catch (error: any) {
    toastError('Error', error);
}
```

## 🔄 Data Flow

1. **Component mounts** → Dispatch fetch actions
2. **Redux state updates** → Components re-render
3. **User interaction** → Dispatch action
4. **API call** → Update state
5. **UI updates** → Show result

## 📊 Performance Metrics

- **Initial Load**: Optimized with async thunks
- **Search**: Instant client-side filtering
- **Re-renders**: Minimized with memoization
- **Bundle Size**: Tree-shakeable Redux Toolkit

## 🎯 Future Enhancements

- [ ] Add pagination for large datasets
- [ ] Implement virtual scrolling
- [ ] Add export functionality
- [ ] Bulk operations
- [ ] Advanced filtering options
- [ ] Role-based permissions UI

## 📚 Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)
- [TypeScript with Redux](https://redux.js.org/usage/usage-with-typescript)

---

**Note**: Make sure to install `@reduxjs/toolkit` and `react-redux` before running the application.
