import { Body, Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBody, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { EmployeesService } from './employees.service';
import { EmployeesBulkService } from './employees-bulk.service';
import { CreateEmployeeModel, UpdateEmployeeModel, DeleteEmployeeModel, GetEmployeeModel, GetAllEmployeesModel, GetEmployeeByIdModel, BulkImportResponseModel, CompanyIdRequestModel, CreateSlackUserModel, UpdateSlackUserModel, DeleteSlackUserModel, GetSlackUserModel, GetSlackUserByIdModel, GetAllSlackUsersModel } from '@adminvault/shared-models';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
    constructor(
        private service: EmployeesService,
        private bulkService: EmployeesBulkService
    ) { }

    @Post('bulk-import')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                companyId: { type: 'number' },
                userId: { type: 'number' }
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async bulkImport(
        @UploadedFile() file: any,
        @Body('companyId') companyId: number,
        @Body('userId') userId: number
    ): Promise<BulkImportResponseModel> {
        try {
            if (!file) {
                return new BulkImportResponseModel(false, 400, 'No file provided', 0, 0, []);
            }
            return await this.bulkService.processBulkImport(file.buffer, Number(companyId), Number(userId));
        } catch (error) {
            return returnException(BulkImportResponseModel, error);
        }
    }

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
     * @param reqModel - Request with company ID
     * @returns GetAllEmployeesModel with list of employees
     */
    @Post('getAllEmployees')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllEmployees(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllEmployeesModel> {
        try {
            return await this.service.getAllEmployees(reqModel.id);
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

    // Slack User Endpoints
    @Post('createSlackUser')
    @ApiBody({ type: CreateSlackUserModel })
    async createSlackUser(@Body() reqModel: CreateSlackUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.createSlackUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateSlackUser')
    @ApiBody({ type: UpdateSlackUserModel })
    async updateSlackUser(@Body() reqModel: UpdateSlackUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateSlackUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('deleteSlackUser')
    @ApiBody({ type: DeleteSlackUserModel })
    async deleteSlackUser(@Body() reqModel: DeleteSlackUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteSlackUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getSlackUser')
    @ApiBody({ type: GetSlackUserModel })
    async getSlackUser(@Body() reqModel: GetSlackUserModel): Promise<GetSlackUserByIdModel> {
        try {
            return await this.service.getSlackUser(reqModel);
        } catch (error) {
            return returnException(GetSlackUserByIdModel, error);
        }
    }

    @Post('getAllSlackUsers')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllSlackUsers(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllSlackUsersModel> {
        try {
            return await this.service.getAllSlackUsers(reqModel.id);
        } catch (error) {
            return returnException(GetAllSlackUsersModel, error);
        }
    }
}
