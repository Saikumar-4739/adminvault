import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly service: ReportsService) { }

    @Get('generate')
    async generateReport(@Query('type') type: string, @Query() filters: any) {
        return this.service.generateReport(type, filters);
    }
}
