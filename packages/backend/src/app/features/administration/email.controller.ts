import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { EmailInfoService } from './email-info.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { returnException, GlobalResponse } from '@adminvault/backend-utils';
import {
    CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel,
    GetEmailInfoModel, GetAllEmailInfoModel, EmailStatsResponseModel
} from '@adminvault/shared-models';

@ApiTags('Email Settings')
@Controller('administration/email')
@UseGuards(JwtAuthGuard)
export class EmailController {
    constructor(private readonly emailService: EmailInfoService) { }

    @Post('get-all')
    async getAllEmailInfo(@Req() req: any): Promise<GetAllEmailInfoModel> {
        try {
            return await this.emailService.getAllEmailInfo(req.user.companyId);
        } catch (error) {
            return returnException(GetAllEmailInfoModel, error);
        }
    }

    @Post('create')
    @ApiBody({ type: CreateEmailInfoModel })
    async createEmailInfo(@Body() body: CreateEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.emailService.createEmailInfo(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('update')
    @ApiBody({ type: UpdateEmailInfoModel })
    async updateEmailInfo(@Body() body: UpdateEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.emailService.updateEmailInfo(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('delete')
    @ApiBody({ type: DeleteEmailInfoModel })
    async deleteEmailInfo(@Body() body: DeleteEmailInfoModel): Promise<GlobalResponse> {
        try {
            return await this.emailService.deleteEmailInfo(body);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('stats')
    async getEmailStats(@Req() req: any): Promise<EmailStatsResponseModel> {
        try {
            return await this.emailService.getEmailStats(req.user.companyId);
        } catch (error) {
            return returnException(EmailStatsResponseModel, error);
        }
    }
}
