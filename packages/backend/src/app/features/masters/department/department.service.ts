import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { DepartmentRepository } from './repositories/department.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateDepartmentModel, UpdateDepartmentModel, GetAllDepartmentsResponseModel, CreateDepartmentResponseModel, DepartmentDropdownModel, DepartmentDropdownResponse, UpdateDepartmentResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { DepartmentsMasterEntity } from './entities/department.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class DepartmentService {
    constructor(
        private dataSource: DataSource,
        private deptRepo: DepartmentRepository
    ) { }

    /**
     * Create a new department
     * Validates required fields and ensures department name uniqueness
     */
    async createDepartment(reqModel: CreateDepartmentModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.name) {
                throw new ErrorResponse(0, "Department name is required");
            }

            const existingDepartment = await this.deptRepo.findOne({ where: { name: reqModel.name } });
            if (existingDepartment) {
                throw new ErrorResponse(0, "Department with this name already exists");
            }

            if (reqModel.code) {
                const codeExists = await this.deptRepo.findOne({ where: { code: reqModel.code } });
                if (codeExists) {
                    throw new ErrorResponse(0, 'Department code already in use');
                }
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentsMasterEntity);
            const { id, companyId, ...createData } = reqModel;
            const newItem = repo.create(createData);
            await repo.save(newItem);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 201, 'Department created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Update an existing department
     * Modifies department information for an existing department record
     */
    async updateDepartment(reqModel: UpdateDepartmentModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, 'Department ID is required');
            }

            const existing = await this.deptRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Department not found');
            }

            if (reqModel.name !== undefined && reqModel.name.trim() === '') {
                throw new ErrorResponse(0, 'Department name cannot be empty');
            }

            if (reqModel.code) {
                const codeExists = await this.deptRepo.findOne({ where: { code: reqModel.code, id: Not(reqModel.id) } });
                if (codeExists) {
                    throw new ErrorResponse(0, 'Department code already in use');
                }
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentsMasterEntity);
            await repo.update(reqModel.id, {
                name: reqModel.name,
                description: reqModel.description,
                code: reqModel.code,
                isActive: reqModel.isActive
            });
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Department updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Get a specific department by ID
     * Retrieves detailed information about a single department
     */
    async getDepartment(reqModel: IdRequestModel): Promise<CreateDepartmentResponseModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Department ID is required");
            }

            const department = await this.deptRepo.findOne({ where: { id: reqModel.id } });
            if (!department) {
                throw new ErrorResponse(0, "Department not found");
            }

            return new CreateDepartmentResponseModel(true, 200, "Department retrieved successfully", department);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all departments in the system
     * Retrieves a list of all registered departments
     */
    async getAllDepartments(): Promise<GetAllDepartmentsResponseModel> {
        try {
            const departments = await this.deptRepo.find();
            const departmentsWithCompanyName = departments.map(dept => ({
                id: dept.id,
                userId: dept.userId || 0,
                createdAt: dept.createdAt,
                updatedAt: dept.updatedAt,
                name: dept.name,
                description: dept.description,
                isActive: dept.isActive,
                code: dept.code,
            }));
            return new GetAllDepartmentsResponseModel(true, 200, 'Departments retrieved successfully', departmentsWithCompanyName);
        } catch (error) {
            throw error;;
        }
    }

    /**
     * Get all departments for dropdown (lightweight)
     * Returns only id and name for dropdown/select components
     */
    async getAllDepartmentsDropdown(): Promise<DepartmentDropdownResponse> {
        try {
            const departments = await this.deptRepo.find({ select: ['id', 'name'] });
            const dropdownData = departments.map(dept => new DepartmentDropdownModel(dept.id, dept.name));
            return new DepartmentDropdownResponse(true, 200, "Departments retrieved successfully", dropdownData);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a department (hard delete)
     * Permanently removes a department from the database
     */
    async deleteDepartment(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Department ID is required");
            }

            const existing = await this.deptRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, 'Department not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentsMasterEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Department deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
