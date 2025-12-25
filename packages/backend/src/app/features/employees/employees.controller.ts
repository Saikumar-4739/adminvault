import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { EmployeesService } from './employees.service';
import { CreateEmployeeModel, UpdateEmployeeModel, DeleteEmployeeModel, GetEmployeeModel, GetAllEmployeesModel, GetEmployeeByIdModel } from '@adminvault/shared-models';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
    constructor(
        private service: EmployeesService
    ) { }

    /**
     * Create a new employee record
     * @param reqModel - Employee creation data
     * @returns GlobalResponse indicating creation success
     */
    @Post('createEmployee')
    @ApiBody({ type: CreateEmployeeModel })
    async createEmployee(@Body() reqModel: CreateEmployeeModel): Promise<GlobalResponse> {
        try {
            return await this.service.createEmployee(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Update existing employee information
     * @param reqModel - Employee update data
     * @returns GlobalResponse indicating update success
     */
    @Post('updateEmployee')
    @ApiBody({ type: UpdateEmployeeModel })
    async updateEmployee(@Body() reqModel: UpdateEmployeeModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateEmployee(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Retrieve a specific employee by ID
     * @param reqModel - Request with employee ID
     * @returns GetEmployeeByIdModel with employee details
     */
    @Post('getEmployee')
    @ApiBody({ type: GetEmployeeModel })
    async getEmployee(@Body() reqModel: GetEmployeeModel): Promise<GetEmployeeByIdModel> {
        try {
            return await this.service.getEmployee(reqModel);
        } catch (error) {
            return returnException(GetEmployeeByIdModel, error);
        }
    }

    /**
     * Retrieve all employees, optionally filtered by company
     * @param companyId - Optional company ID query parameter
     * @returns GetAllEmployeesModel with list of employees
     */
    @Post('getAllEmployees')
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    async getAllEmployees(@Query('companyId') companyId?: number): Promise<GetAllEmployeesModel> {
        try {
            return await this.service.getAllEmployees(companyId);
        } catch (error) {
            return returnException(GetAllEmployeesModel, error);
        }
    }

    /**
     * Delete an employee record (soft delete)
     * @param reqModel - Request with employee ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('deleteEmployee')
    @ApiBody({ type: DeleteEmployeeModel })
    async deleteEmployee(@Body() reqModel: DeleteEmployeeModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteEmployee(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
