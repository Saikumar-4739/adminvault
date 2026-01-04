import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
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

    /**
     * Create a new email info record
     * @param reqModel - Email info creation data
     * @returns GlobalResponse indicating creation success
     */
    @Post('createEmailInfo')
    @ApiBody({ type: CreateEmailInfoModel })
    async createEmailInfo(@Body() reqModel: CreateEmailInfoModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.createEmailInfo(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Update existing email info record
     * @param reqModel - Email info update data
     * @returns GlobalResponse indicating update success
     */
    @Post('updateEmailInfo')
    @ApiBody({ type: UpdateEmailInfoModel })
    async updateEmailInfo(@Body() reqModel: UpdateEmailInfoModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.updateEmailInfo(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Retrieve a specific email info record by ID
     * @param reqModel - Request with email info ID
     * @returns GetEmailInfoByIdModel with email info details
     */
    @Post('getEmailInfo')
    @ApiBody({ type: GetEmailInfoModel })
    async getEmailInfo(@Body() reqModel: GetEmailInfoModel): Promise<GetEmailInfoByIdModel> {
        try {
            return await this.service.getEmailInfo(reqModel);
        } catch (error) {
            return returnException(GetEmailInfoByIdModel, error);
        }
    }

    /**
     * Retrieve all email info records, optionally filtered by company
     * @param companyId - Optional company ID query parameter
     * @returns GetAllEmailInfoModel with list of email info records
     */
    @Post('getAllEmailInfo')
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    async getAllEmailInfo(@Query('companyId') companyId?: number): Promise<GetAllEmailInfoModel> {
        try {
            return await this.service.getAllEmailInfo(companyId);
        } catch (error) {
            return returnException(GetAllEmailInfoModel, error);
        }
    }

    /**
     * Delete an email info record
     * @param reqModel - Request with email info ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('deleteEmailInfo')
    @ApiBody({ type: DeleteEmailInfoModel })
    async deleteEmailInfo(@Body() reqModel: DeleteEmailInfoModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.deleteEmailInfo(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
