import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentModel, UpdateDepartmentModel, DepartmentDropdownResponse, IdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { AuditLog } from '../../audit-logs/audit-log.decorator';

@ApiTags('Departments Master')
@Controller('department')
@UseGuards(JwtAuthGuard)
export class DepartmentController {
    constructor(private service: DepartmentService) { }

    @Post('createDepartment')
    @ApiBody({ type: CreateDepartmentModel })
    @AuditLog({ action: 'CREATE', module: 'Department' })
    async createDepartment(@Body() reqModel: CreateDepartmentModel): Promise<GlobalResponse> {
        try {
            return await this.service.createDepartment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateDepartment')
    @ApiBody({ type: UpdateDepartmentModel })
    @AuditLog({ action: 'UPDATE', module: 'Department' })
    async updateDepartment(@Body() reqModel: UpdateDepartmentModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateDepartment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getDepartment')
    @ApiBody({ type: IdRequestModel })
    async getDepartment(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.getDepartment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllDepartments')
    async getAllDepartments(): Promise<GlobalResponse> {
        try {
            return await this.service.getAllDepartments();
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAllDepartmentsDropdown')
    async getAllDepartmentsDropdown(): Promise<DepartmentDropdownResponse> {
        try {
            return await this.service.getAllDepartmentsDropdown();
        } catch (error) {
            return returnException(DepartmentDropdownResponse, error);
        }
    }

    @Post('deleteDepartment')
    @ApiBody({ type: IdRequestModel })
    @AuditLog({ action: 'DELETE', module: 'Department' })
    async deleteDepartment(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteDepartment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
