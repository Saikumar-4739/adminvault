import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmployeesRepository } from './repositories/employees.repository';
import { EmployeesEntity } from './entities/employees.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateEmployeeModel, UpdateEmployeeModel, DeleteEmployeeModel, GetEmployeeModel, GetAllEmployeesModel, GetEmployeeByIdModel, EmployeeResponseModel, CreateSlackUserModel, UpdateSlackUserModel, DeleteSlackUserModel, GetSlackUserModel, GetSlackUserByIdModel, GetAllSlackUsersModel, SlackUserModel } from '@adminvault/shared-models';

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

    // Slack related methods
    async createSlackUser(reqModel: CreateSlackUserModel): Promise<GlobalResponse> {
        try {
            const existingEmployee = await this.employeesRepo.findOne({
                where: { email: reqModel.email }
            });

            if (existingEmployee) {
                // If employee exists, update their slack info
                existingEmployee.slackUserId = reqModel.slackUserId;
                existingEmployee.slackDisplayName = reqModel.displayName;
                existingEmployee.slackAvatar = reqModel.avatar;
                existingEmployee.isSlackActive = true;
                await this.employeesRepo.save(existingEmployee);
                return new GlobalResponse(true, 200, 'Slack info updated for existing employee');
            }

            const newEmployee = this.employeesRepo.create({
                firstName: reqModel.name.split(' ')[0],
                lastName: reqModel.name.split(' ').slice(1).join(' ') || '',
                email: reqModel.email,
                companyId: reqModel.companyId,
                slackUserId: reqModel.slackUserId,
                slackDisplayName: reqModel.displayName,
                slackAvatar: reqModel.avatar,
                isSlackActive: true,
                phNumber: reqModel.phone,
                remarks: reqModel.notes,
                departmentId: 1, // Default department ID, should be handled better
                empStatus: 1 // Default status
            } as any);

            await this.employeesRepo.save(newEmployee);
            return new GlobalResponse(true, 201, 'Slack user created as employee successfully');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to create Slack user');
        }
    }

    async updateSlackUser(reqModel: UpdateSlackUserModel): Promise<GlobalResponse> {
        try {
            const employee = await this.employeesRepo.findOne({ where: { id: reqModel.id } });
            if (!employee) {
                throw new ErrorResponse(404, 'Employee not found');
            }

            if (reqModel.name) {
                employee.firstName = reqModel.name.split(' ')[0];
                employee.lastName = reqModel.name.split(' ').slice(1).join(' ') || '';
            }
            if (reqModel.email) employee.email = reqModel.email;
            if (reqModel.slackUserId) employee.slackUserId = reqModel.slackUserId;
            if (reqModel.displayName) employee.slackDisplayName = reqModel.displayName;
            if (reqModel.avatar) employee.slackAvatar = reqModel.avatar;
            if (reqModel.isActive !== undefined) employee.isSlackActive = reqModel.isActive;
            if (reqModel.phone) employee.phNumber = reqModel.phone;
            if (reqModel.notes) employee.remarks = reqModel.notes;

            await this.employeesRepo.save(employee);
            return new GlobalResponse(true, 200, 'Slack user info updated successfully');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Slack user');
        }
    }

    async deleteSlackUser(reqModel: DeleteSlackUserModel): Promise<GlobalResponse> {
        try {
            const result = await this.employeesRepo.update(reqModel.id, { isSlackActive: false });
            if (result.affected === 0) {
                throw new ErrorResponse(404, 'Slack user not found');
            }
            return new GlobalResponse(true, 200, 'Slack user deactivated successfully');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to deactivate Slack user');
        }
    }

    async getSlackUser(reqModel: GetSlackUserModel): Promise<GetSlackUserByIdModel> {
        try {
            const employee = await this.employeesRepo.findOne({ where: { id: reqModel.id } });
            if (!employee) {
                throw new ErrorResponse(404, 'Slack user not found');
            }
            const slackUser: SlackUserModel = {
                id: employee.id,
                slackUserId: employee.slackUserId,
                name: `${employee.firstName} ${employee.lastName}`,
                email: employee.email,
                displayName: employee.slackDisplayName,
                avatar: employee.slackAvatar,
                isActive: employee.isSlackActive,
                phone: employee.phNumber,
                notes: employee.remarks,
                companyId: employee.companyId,
                createdAt: employee.createdAt,
                updatedAt: employee.updatedAt
            };
            return new GetSlackUserByIdModel(true, 200, 'Slack user retrieved successfully', slackUser);
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to fetch Slack user');
        }
    }

    async getAllSlackUsers(companyId?: number): Promise<GetAllSlackUsersModel> {
        try {
            const where = companyId ? { companyId } : {};
            const employees = await this.employeesRepo.find({ where });
            const slackUsers: SlackUserModel[] = employees
                .filter(emp => emp.slackUserId || emp.isSlackActive)
                .map(emp => ({
                    id: emp.id,
                    slackUserId: emp.slackUserId,
                    name: `${emp.firstName} ${emp.lastName}`,
                    email: emp.email,
                    displayName: emp.slackDisplayName,
                    avatar: emp.slackAvatar,
                    isActive: emp.isSlackActive,
                    phone: emp.phNumber,
                    notes: emp.remarks,
                    companyId: emp.companyId,
                    createdAt: emp.createdAt,
                    updatedAt: emp.updatedAt
                }));
            return new GetAllSlackUsersModel(true, 200, 'Slack users retrieved successfully', slackUsers);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Slack users');
        }
    }
}
