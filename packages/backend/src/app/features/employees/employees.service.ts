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

    async createEmployee(reqModel: CreateEmployeeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            // Validation
            if (!reqModel.companyId) {
                throw new ErrorResponse(0, "Company ID is required");
            }

            if (!reqModel.email) {
                throw new ErrorResponse(0, "Email is required");
            }
            if (!reqModel.department) {
                throw new ErrorResponse(0, "Department is required");
            }

            // Check if email already exists
            const existingEmployee = await this.employeesRepo.findOne({
                where: { email: reqModel.email }
            });

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
            newEmployee.department = reqModel.department;
            await transManager.getRepository(EmployeesEntity).save(newEmployee);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Employee created successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateEmployee(reqModel: UpdateEmployeeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Employee ID is required");
            }

            // Check if employee exists
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
            updateData.department = reqModel.department;
            updateData.remarks = reqModel.remarks;

            await transManager.getRepository(EmployeesEntity).update(reqModel.id, updateData);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Employee updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getEmployee(reqModel: GetEmployeeModel): Promise<GetEmployeeByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Employee ID is required");
            }

            const employee = await this.employeesRepo.findOne({ where: { id: reqModel.id } });
            if (!employee) {
                throw new ErrorResponse(0, "Employee not found");
            }

            const employeeResponse = new EmployeeResponseModel(employee.id, employee.companyId, employee.firstName, employee.lastName, employee.email, employee.department, employee.empStatus, employee.phNumber, employee.billingAmount, employee.remarks);
            return new GetEmployeeByIdModel(true, 0, "Employee retrieved successfully", employeeResponse);
        } catch (error) {
            throw error;
        }
    }

    async getAllEmployees(companyId?: number): Promise<GetAllEmployeesModel> {
        try {
            let employees: EmployeesEntity[];

            if (companyId) {
                employees = await this.employeesRepo.find({ where: { companyId } });
            } else {
                employees = await this.employeesRepo.find();
            }

            const employeeResponses = employees.map(emp => new EmployeeResponseModel(emp.id, emp.companyId, emp.firstName, emp.lastName, emp.email, emp.department, emp.empStatus, emp.phNumber, emp.billingAmount, emp.remarks));
            return new GetAllEmployeesModel(true, 0, "Employees retrieved successfully", employeeResponses);
        } catch (error) {
            throw error;
        }
    }

    async deleteEmployee(reqModel: DeleteEmployeeModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Employee ID is required");
            }

            // Check if employee exists
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
