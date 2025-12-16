import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { returnException } from '@adminvault/backend-utils';
import { AuthUsersService } from './auth-users.service';

@ApiTags('Auth Users')
@Controller('auth-users')
export class AuthUsersController {
    constructor(
        private service: AuthUsersService
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
            return { success: true, message: 'User deleted successfully' };
        } catch (err) {
            return returnException(Object, err);
        }
    }
}
