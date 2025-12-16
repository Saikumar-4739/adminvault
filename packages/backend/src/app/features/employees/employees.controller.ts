import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { returnException } from '@adminvault/backend-utils';
import { EmployeesService } from './employees.service';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
    constructor(
        private service: EmployeesService
    ) {}

    @Get()
    async findAll(@Body() req: any): Promise<any> {
        try {
            return await this.service.findAll();
        } catch (err) {
            return returnException(Object, err);
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<any> {
        try {
            return await this.service.findOne(id);
        } catch (err) {
            return returnException(Object, err);
        }
    }

    @Get('company/:companyId')
    async findByCompany(@Param('companyId') companyId: number): Promise<any> {
        try {
            return await this.service.findByCompany(companyId);
        } catch (err) {
            return returnException(Object, err);
        }
    }

    @Post()
    async create(@Body() dto: any): Promise<any> {
        try {
            return await this.service.create(dto);
        } catch (err) {
            return returnException(Object, err);
        }
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() dto: any): Promise<any> {
        try {
            return await this.service.update(id, dto);
        } catch (err) {
            return returnException(Object, err);
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<any> {
        try {
            await this.service.remove(id);
            return { success: true, message: 'Employee deleted successfully' };
        } catch (err) {
            return returnException(Object, err);
        }
    }
}
