import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { returnException } from '@adminvault/backend-utils';
import { EmailAccountsService } from './email-accounts.service';

@ApiTags('Email Accounts')
@Controller('email-accounts')
export class EmailAccountsController {
    constructor(
        private service: EmailAccountsService
    ) { }

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
            return { success: true, message: 'Email account deleted successfully' };
        } catch (err) {
            return returnException(Object, err);
        }
    }
}
