'use client';

import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '@/lib/api/services';
import { CreateEmployeeModel, UpdateEmployeeModel, DeleteEmployeeModel, GetEmployeeModel } from '@adminvault/shared-models';
import { useToast } from '@/contexts/ToastContext';

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phNumber?: string;
    companyId: number;
    departmentId: number;
    departmentName?: string;
    empStatus: string;
    billingAmount?: number;
    remarks?: string;
    createdAt?: string;
}

// Simple global cache for SWR-like behavior
const employeesCache: Record<string, Employee[]> = {};

export function useEmployees(companyId?: number) {
    const cacheKey = `employees_${companyId || 'all'}`;
    const [employees, setEmployees] = useState<Employee[]>(employeesCache[cacheKey] || []);
    const [isLoading, setIsLoading] = useState(!employeesCache[cacheKey]);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchEmployees = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await employeeService.getAllEmployees(companyId as any);

            if (response.status) {
                const data = (response as any).employees || response.data || [];
                const mappedEmployees: Employee[] = data.map((item: any) => ({
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
                    createdAt: item.createdAt || new Date().toISOString()
                }));
                employeesCache[cacheKey] = mappedEmployees;
                setEmployees(mappedEmployees);
            } else {
                throw new Error(response.message || 'Failed to fetch employees');
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch employees';
            setError(errorMessage);
            toast.error('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [companyId, toast]);

    const createEmployee = useCallback(
        async (data: CreateEmployeeModel) => {
            try {
                setIsLoading(true);
                const response = await employeeService.createEmployee(data);

                if (response.status) {
                    await fetchEmployees();
                    return { success: true, message: response.message || 'Employee created successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to create employee' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to create employee' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchEmployees]
    );

    const updateEmployee = useCallback(
        async (data: UpdateEmployeeModel) => {
            try {
                setIsLoading(true);
                const response = await employeeService.updateEmployee(data);

                if (response.status) {
                    await fetchEmployees();
                    return { success: true, message: response.message || 'Employee updated successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to update employee' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to update employee' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchEmployees]
    );

    const deleteEmployee = useCallback(
        async (data: DeleteEmployeeModel) => {
            try {
                setIsLoading(true);
                const response = await employeeService.deleteEmployee(data);

                if (response.status) {
                    await fetchEmployees();
                    return { success: true, message: response.message || 'Employee deleted successfully' };
                } else {
                    return { success: false, message: response.message || 'Failed to delete employee' };
                }
            } catch (err: any) {
                return { success: false, message: err.message || 'Failed to delete employee' };
            } finally {
                setIsLoading(false);
            }
        },
        [fetchEmployees]
    );

    const getEmployee = useCallback(
        async (data: GetEmployeeModel) => {
            try {
                setIsLoading(true);
                const response = await employeeService.getEmployee(data);

                if (response.status && response.data) {
                    return response.data as Employee;
                } else {
                    throw new Error(response.message || 'Failed to fetch employee');
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to fetch employee';
                toast.error('Error', errorMessage);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [toast]
    );

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return {
        employees,
        isLoading,
        error,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployee,
    };
}
