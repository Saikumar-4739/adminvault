import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { EmployeesRepository } from './repositories/employees.repository';
import { EmployeesEntity } from './entities/employees.entity';
import { CompanyInfoEntity } from '../masters/company-info/entities/company-info.entity';
import { DepartmentsMasterEntity } from '../masters/department/entities/department.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateEmployeeModel, UpdateEmployeeModel, DeleteEmployeeModel, GetEmployeeModel, GetAllEmployeesResponseModel, GetEmployeeResponseModel, EmployeeResponseModel, CompanyIdRequestModel, EmployeeStatusEnum } from '@adminvault/shared-models';

@Injectable()
export class EmployeesService {
    constructor(
        private dataSource: DataSource,
        private employeesRepo: EmployeesRepository
    ) { }

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

            const companyExists = await this.dataSource.getRepository(CompanyInfoEntity).findOne({ where: { id: reqModel.companyId } });
            if (!companyExists) {
                throw new ErrorResponse(0, "Invalid Company ID: Company does not exist");
            }

            const deptExists = await this.dataSource.getRepository(DepartmentsMasterEntity).findOne({ where: { id: reqModel.departmentId } });
            if (!deptExists) {
                throw new ErrorResponse(0, "Invalid Department ID: Department does not exist");
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

    async getEmployee(reqModel: GetEmployeeModel): Promise<GetEmployeeResponseModel> {
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

            let deptName = `Dept ID: ${employee.departmentId}`;
            const department = await this.dataSource.getRepository(DepartmentsMasterEntity).findOne({ where: { id: employee.departmentId } });
            if (department) {
                deptName = department.name;
            }

            const employeeResponse = new EmployeeResponseModel(employee.id, employee.companyId, employee.firstName, employee.lastName, employee.email, employee.departmentId, employee.empStatus, employee.phNumber, employee.billingAmount, employee.remarks, deptName);
            return new GetEmployeeResponseModel(true, 0, "Employee retrieved successfully", employeeResponse);
        } catch (error) {
            throw error;
        }
    }

    async getAllEmployees(reqModel: CompanyIdRequestModel): Promise<GetAllEmployeesResponseModel> {
        try {
            let employees: EmployeesEntity[];
            const companyId = reqModel.companyId;

            if (companyId) {
                employees = await this.employeesRepo.find({ where: { companyId } });
            } else {
                employees = await this.employeesRepo.find();
            }

            const deptIds = [...new Set(employees.map(e => e.departmentId))];
            let deptMap = new Map<number, string>();

            if (deptIds.length > 0) {
                const departments = await this.dataSource.getRepository(DepartmentsMasterEntity).find({
                    where: { id: In(deptIds) }
                });
                departments.forEach(d => deptMap.set(d.id, d.name));
            }

            const employeeResponses = employees.map(emp => new EmployeeResponseModel(emp.id, emp.companyId, emp.firstName, emp.lastName, emp.email, emp.departmentId, emp.empStatus, emp.phNumber, emp.billingAmount, emp.remarks, deptMap.get(emp.departmentId) || `Dept ID: ${emp.departmentId}`));
            return new GetAllEmployeesResponseModel(true, 0, "Employees retrieved successfully", employeeResponses);
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
