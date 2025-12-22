
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { LicensesService } from './licenses.service';


@Controller('licenses')
export class LicensesController {
    constructor(private readonly licensesService: LicensesService) { }

    @Get()
    async findAll(@Query('companyId') companyId?: number) {
        return this.licensesService.findAll(companyId);
    }

    @Get('stats')
    async getStats(@Query('companyId') companyId?: number) {
        return this.licensesService.getStats(companyId);
    }

    @Post()
    async create(@Body() createDto: any) {
        return this.licensesService.create(createDto);
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body() updateDto: any) {
        return this.licensesService.update(id, updateDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.licensesService.remove(id);
    }
}
