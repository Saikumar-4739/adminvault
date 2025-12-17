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

    @Post('createEmployee')
    @ApiBody({ type: CreateEmployeeModel })
    async createEmployee(@Body() reqModel: CreateEmployeeModel): Promise<GlobalResponse> {
        try {
            return await this.service.createEmployee(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateEmployee')
    @ApiBody({ type: UpdateEmployeeModel })
    async updateEmployee(@Body() reqModel: UpdateEmployeeModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateEmployee(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getEmployee')
    @ApiBody({ type: GetEmployeeModel })
    async getEmployee(@Body() reqModel: GetEmployeeModel): Promise<GetEmployeeByIdModel> {
        try {
            return await this.service.getEmployee(reqModel);
        } catch (error) {
            return returnException(GetEmployeeByIdModel, error);
        }
    }

    @Get('getAllEmployees')
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    async getAllEmployees(@Query('companyId') companyId?: number): Promise<GetAllEmployeesModel> {
        try {
            return await this.service.getAllEmployees(companyId);
        } catch (error) {
            return returnException(GetAllEmployeesModel, error);
        }
    }

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
