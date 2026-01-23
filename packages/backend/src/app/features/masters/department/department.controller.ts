import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentModel, UpdateDepartmentModel, GetAllDepartmentsResponseModel, CreateDepartmentResponseModel, UpdateDepartmentResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Departments Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class DepartmentController {
    constructor(private departmentService: DepartmentService) { }

    @Post('getAllDepartments')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllDepartments(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllDepartmentsResponseModel> {
        try {
            return await this.departmentService.getAllDepartments();
        } catch (error) {
            return returnException(GetAllDepartmentsResponseModel, error);
        }
    }

    @Post('departments')
    @ApiBody({ type: CreateDepartmentModel })
    async createDepartment(@Body() data: CreateDepartmentModel, @Req() req: any): Promise<CreateDepartmentResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.departmentService.createDepartment(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateDepartmentResponseModel, error);
        }
    }

    @Post('updateDepartment')
    @ApiBody({ type: UpdateDepartmentModel })
    async updateDepartment(@Body() data: UpdateDepartmentModel, @Req() req: any): Promise<UpdateDepartmentResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.departmentService.updateDepartment(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateDepartmentResponseModel, error);
        }
    }

    @Post('deleteDepartment')
    @ApiBody({ type: IdRequestModel })
    async deleteDepartment(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.departmentService.deleteDepartment(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
