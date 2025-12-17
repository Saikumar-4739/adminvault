import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { EmailInfoService } from './email-info.service';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetAllEmailInfoModel, GetEmailInfoByIdModel } from '@adminvault/shared-models';

@ApiTags('Email Info')
@Controller('email-info')
export class EmailInfoController {
    constructor(
        private service: EmailInfoService
    ) { }

    @Post('createEmailInfo')
    @ApiBody({ type: CreateEmailInfoModel })
    async createEmailInfo(@Body() reqModel: CreateEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.service.createEmailInfo(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('updateEmailInfo')
    @ApiBody({ type: UpdateEmailInfoModel })
    async updateEmailInfo(@Body() reqModel: UpdateEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateEmailInfo(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('getEmailInfo')
    @ApiBody({ type: GetEmailInfoModel })
    async getEmailInfo(@Body() reqModel: GetEmailInfoModel): Promise<GetEmailInfoByIdModel> {
        try {
            return await this.service.getEmailInfo(reqModel);
        } catch (error) {
            return returnException(GetEmailInfoByIdModel, error);
        }
    }

    @Get('getAllEmailInfo')
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    async getAllEmailInfo(@Query('companyId') companyId?: number): Promise<GetAllEmailInfoModel> {
        try {
            return await this.service.getAllEmailInfo(companyId);
        } catch (error) {
            return returnException(GetAllEmailInfoModel, error);
        }
    }

    @Post('deleteEmailInfo')
    @ApiBody({ type: DeleteEmailInfoModel })
    async deleteEmailInfo(@Body() reqModel: DeleteEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteEmailInfo(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
