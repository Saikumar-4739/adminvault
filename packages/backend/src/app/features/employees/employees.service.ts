import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmployeesRepository } from '../../repository/employees.repository';
import { EmployeesEntity } from '../../entities/employees.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateEmployeeModel, UpdateEmployeeModel, DeleteEmployeeModel, GetEmployeeModel, GetAllEmployeesModel, GetEmployeeByIdModel, EmployeeResponseModel } from '@adminvault/shared-models';

@Injectable()
export class EmployeesService {
    constructor(
        private dataSource: DataSource,
        private employeesRepo: EmployeesRepository
    ) { }

    /**
     * Create a new employee record
     * Validates required fields and checks for duplicate email addresses
     * 
     * @param reqModel - Employee creation data including company ID, name, email, and department
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if company ID, email, or department is missing, or if email already exists
     */
    async createEmployee(reqModel: CreateEmployeeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.companyId) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            if (!reqModel.email) {
                throw new ErrorResponse(0, "Email is required");
            }
            if (!reqModel.departmentId) {
                throw new ErrorResponse(0, "Department is required");
            }

            const existingEmployee = await this.employeesRepo.findOne({ where: { email: reqModel.email } });
            if (existingEmployee) {
                throw new ErrorResponse(0, "Employee with this email already exists");
            }

            await transManager.startTransaction();
            const newEmployee = new EmployeesEntity();
            newEmployee.companyId = reqModel.companyId;
            newEmployee.firstName = reqModel.firstName;
            newEmployee.lastName = reqModel.lastName;
            newEmployee.email = reqModel.email;
            newEmployee.empStatus = reqModel.empStatus;
            newEmployee.departmentId = reqModel.departmentId;
            await transManager.getRepository(EmployeesEntity).save(newEmployee);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Employee created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Update existing employee information
     * Updates employee details including name, contact info, status, and billing amount
     * 
     * @param reqModel - Employee update data with employee ID and fields to update
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if employee ID is missing or employee not found
     */
    async updateEmployee(reqModel: UpdateEmployeeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Employee ID is required");
            }

            const existingEmployee = await this.employeesRepo.findOne({ where: { id: reqModel.id } });
            if (!existingEmployee) {
                throw new ErrorResponse(0, "Employee not found");
            }

            await transManager.startTransaction();
            const updateData: Partial<EmployeesEntity> = {};
            updateData.firstName = reqModel.firstName;
            updateData.lastName = reqModel.lastName;
            updateData.email = reqModel.email;
            updateData.phNumber = reqModel.phNumber;
            updateData.empStatus = reqModel.empStatus;
            updateData.billingAmount = reqModel.billingAmount;
            updateData.departmentId = reqModel.departmentId;
            updateData.remarks = reqModel.remarks;
            await transManager.getRepository(EmployeesEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Employee updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Retrieve a specific employee by ID
     * Fetches detailed information for a single employee
     * 
     * @param reqModel - Request containing employee ID
     * @returns GetEmployeeByIdModel with employee details
     * @throws ErrorResponse if employee ID is missing or employee not found
     */
    async getEmployee(reqModel: GetEmployeeModel): Promise<GetEmployeeByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Employee ID is required");
            }

            const employee = await this.employeesRepo.findOne({
                where: { id: reqModel.id }
            });
            if (!employee) {
                throw new ErrorResponse(0, "Employee not found");
            }

            const employeeResponse = new EmployeeResponseModel(
                employee.id,
                employee.companyId,
                employee.firstName,
                employee.lastName,
                employee.email,
                employee.departmentId,
                employee.empStatus,
                employee.phNumber,
                employee.billingAmount,
                employee.remarks,
                `Dept ID: ${employee.departmentId}` // Placeholder name
            );
            return new GetEmployeeByIdModel(true, 0, "Employee retrieved successfully", employeeResponse);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieve all employees, optionally filtered by company
     * Fetches list of all employees or employees for a specific company
     * 
     * @param companyId - Optional company ID to filter employees
     * @returns GetAllEmployeesModel with list of employees
     * @throws Error if database query fails
     */
    async getAllEmployees(companyId?: number): Promise<GetAllEmployeesModel> {
        try {
            let employees: EmployeesEntity[];

            if (companyId) {
                employees = await this.employeesRepo.find({
                    where: { companyId }
                });
            } else {
                employees = await this.employeesRepo.find();
            }

            const employeeResponses = employees.map(emp => new EmployeeResponseModel(
                emp.id,
                emp.companyId,
                emp.firstName,
                emp.lastName,
                emp.email,
                emp.departmentId,
                emp.empStatus,
                emp.phNumber,
                emp.billingAmount,
                emp.remarks,
                `Dept ID: ${emp.departmentId}` // Placeholder name
            ));
            return new GetAllEmployeesModel(true, 0, "Employees retrieved successfully", employeeResponses);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete an employee record (soft delete)
     * Marks employee as deleted without removing from database
     * 
     * @param reqModel - Request containing employee ID to delete
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if employee ID is missing or employee not found
     */
    async deleteEmployee(reqModel: DeleteEmployeeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Employee ID is required");
            }

            const existingEmployee = await this.employeesRepo.findOne({ where: { id: reqModel.id } });
            if (!existingEmployee) {
                throw new ErrorResponse(0, "Employee not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(EmployeesEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Employee deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
