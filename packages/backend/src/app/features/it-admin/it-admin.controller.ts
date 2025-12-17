import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ItAdminService } from './it-admin.service';
import { CreateItAdminModel, UpdateItAdminModel, DeleteItAdminModel, GetItAdminModel, GetAllItAdminsModel, GetItAdminByIdModel } from '@adminvault/shared-models';

@ApiTags('IT Admin')
@Controller('it-admin')
export class ItAdminController {
    constructor(private service: ItAdminService) { }

    @Post('createAdmin')
    @ApiBody({ type: CreateItAdminModel })
    async createAdmin(@Body() reqModel: CreateItAdminModel): Promise<GlobalResponse> {
        try {
            return await this.service.createAdmin(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateAdmin')
    @ApiBody({ type: UpdateItAdminModel })
    async updateAdmin(@Body() reqModel: UpdateItAdminModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateAdmin(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getAdmin')
    @ApiBody({ type: GetItAdminModel })
    async getAdmin(@Body() reqModel: GetItAdminModel): Promise<GetItAdminByIdModel> {
        try {
            return await this.service.getAdmin(reqModel);
        } catch (error) {
            return returnException(GetItAdminByIdModel, error);
        }
    }

    @Get('getAllAdmins')
    async getAllAdmins(): Promise<GetAllItAdminsModel> {
        try {
            return await this.service.getAllAdmins();
        } catch (error) {
            return returnException(GetAllItAdminsModel, error);
        }
    }

    @Post('deleteAdmin')
    @ApiBody({ type: DeleteItAdminModel })
    async deleteAdmin(@Body() reqModel: DeleteItAdminModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteAdmin(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
