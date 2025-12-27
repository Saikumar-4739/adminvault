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

export function useEmployees(companyId?: number) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();

    const fetchEmployees = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await employeeService.getAllEmployees(companyId);

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
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to create employee');
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to create employee';
                toast.error('Error', errorMessage);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchEmployees]
    );

    const updateEmployee = useCallback(
        async (data: UpdateEmployeeModel) => {
            try {
                setIsLoading(true);
                const response = await employeeService.updateEmployee(data);

                if (response.status) {
                    await fetchEmployees();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to update employee');
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to update employee';
                toast.error('Error', errorMessage);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchEmployees]
    );

    const deleteEmployee = useCallback(
        async (data: DeleteEmployeeModel) => {
            try {
                setIsLoading(true);
                const response = await employeeService.deleteEmployee(data);

                if (response.status) {
                    await fetchEmployees();
                    return true;
                } else {
                    throw new Error(response.message || 'Failed to delete employee');
                }
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to delete employee';
                toast.error('Error', errorMessage);
                return false;
            } finally {
                setIsLoading(false);
            }
        },
        [toast, fetchEmployees]
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
