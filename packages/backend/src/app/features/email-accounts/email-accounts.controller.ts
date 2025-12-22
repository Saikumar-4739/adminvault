import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { EmailAccountsService } from './email-accounts.service';

@Controller('email-accounts')
export class EmailAccountsController {
    constructor(private readonly service: EmailAccountsService) { }

    @Get()
    async findAll(@Query('companyId') companyId?: number) {
        return this.service.findAll(companyId);
    }

    @Post()
    async create(@Body() body: any) {
        return this.service.create(body);
    }

    @Delete(':id')
    async remove(@Param('id') id: number) {
        return this.service.delete(id);
    }
}
