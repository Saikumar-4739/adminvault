import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeService } from '@/lib/api/services';
import type { CreateEmployeeModel, UpdateEmployeeModel } from '@adminvault/shared-models';

export interface Employee {
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

interface EmployeesState {
    employees: Employee[];
    filteredEmployees: Employee[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    selectedCompanyId: number | null;
}

const initialState: EmployeesState = {
    employees: [],
    filteredEmployees: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedCompanyId: null,
};

// Async thunks
export const fetchEmployees = createAsyncThunk<
    Employee[],
    number | undefined,
    { rejectValue: string }
>(
    'employees/fetchEmployees',
    async (companyId, { rejectWithValue }) => {
        try {
            const response = await employeeService.getAllEmployees(companyId);
            if (response.status) {
                const data = (response as any).employees || response.data || [];
                return data.map((item: any) => ({
                    id: item.id,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    email: item.email,
                    phNumber: item.phNumber,
                    companyId: item.companyId,
                    departmentId: item.departmentId,
                    departmentName: item.departmentName,
                    empStatus: item.empStatus,
                    billingAmount: item.billingAmount,
                    remarks: item.remarks,
                    createdAt: item.createdAt || new Date().toISOString(),
                    updatedAt: item.updatedAt,
                }));
            }
            return rejectWithValue(response.message || 'Failed to fetch employees');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch employees');
        }
    }
);

export const createEmployee = createAsyncThunk<
    { success: boolean; message: string },
    CreateEmployeeModel,
    { rejectValue: string }
>(
    'employees/createEmployee',
    async (data, { rejectWithValue }) => {
        try {
            const response = await employeeService.createEmployee(data);
            if (response.status) {
                return { success: true, message: response.message || 'Employee created successfully' };
            }
            return rejectWithValue(response.message || 'Failed to create employee');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create employee');
        }
    }
);

export const updateEmployee = createAsyncThunk<
    { success: boolean; message: string },
    UpdateEmployeeModel,
    { rejectValue: string }
>(
    'employees/updateEmployee',
    async (data, { rejectWithValue }) => {
        try {
            const response = await employeeService.updateEmployee(data);
            if (response.status) {
                return { success: true, message: response.message || 'Employee updated successfully' };
            }
            return rejectWithValue(response.message || 'Failed to update employee');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to update employee');
        }
    }
);

export const deleteEmployee = createAsyncThunk<
    { success: boolean; message: string },
    { id: number },
    { rejectValue: string }
>(
    'employees/deleteEmployee',
    async (data, { rejectWithValue }) => {
        try {
            const response = await employeeService.deleteEmployee(data);
            if (response.status) {
                return { success: true, message: response.message || 'Employee deleted successfully' };
            }
            return rejectWithValue(response.message || 'Failed to delete employee');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete employee');
        }
    }
);

const employeesSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
            state.filteredEmployees = filterEmployees(state.employees, action.payload);
        },
        setSelectedCompanyId: (state, action: PayloadAction<number | null>) => {
            state.selectedCompanyId = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch employees
            .addCase(fetchEmployees.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.isLoading = false;
                state.employees = action.payload;
                state.filteredEmployees = filterEmployees(action.payload, state.searchQuery);
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to fetch employees';
            })
            // Create employee
            .addCase(createEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createEmployee.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to create employee';
            })
            // Update employee
            .addCase(updateEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to update employee';
            })
            // Delete employee
            .addCase(deleteEmployee.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteEmployee.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'Failed to delete employee';
            });
    },
});

// Helper function to filter employees
const filterEmployees = (employees: Employee[], searchQuery: string): Employee[] => {
    if (!searchQuery) return employees;

    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const departmentName = emp.departmentName?.toLowerCase() || '';

        return (
            fullName.includes(query) ||
            emp.email.toLowerCase().includes(query) ||
            departmentName.includes(query) ||
            emp.phNumber?.includes(query)
        );
    });
};

export const { setSearchQuery, setSelectedCompanyId, clearError } = employeesSlice.actions;
export default employeesSlice.reducer;

// Selectors
export const selectEmployees = (state: { employees: EmployeesState }) => state.employees.employees;
export const selectFilteredEmployees = (state: { employees: EmployeesState }) => state.employees.filteredEmployees;
export const selectEmployeesLoading = (state: { employees: EmployeesState }) => state.employees.isLoading;
export const selectEmployeesError = (state: { employees: EmployeesState }) => state.employees.error;
export const selectSearchQuery = (state: { employees: EmployeesState }) => state.employees.searchQuery;
export const selectSelectedCompanyId = (state: { employees: EmployeesState }) => state.employees.selectedCompanyId;

// Computed selectors
export const selectEmployeeStats = (state: { employees: EmployeesState }) => {
    const employees = state.employees.employees;
    return {
        total: employees.length,
        active: employees.filter(e => e.empStatus === 'Active').length,
        inactive: employees.filter(e => e.empStatus === 'Inactive').length,
        newThisMonth: employees.filter(e => {
            if (!e.createdAt) return false;
            const date = new Date(e.createdAt);
            const now = new Date();
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
    };
};
