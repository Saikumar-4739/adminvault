import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { EmailInfoService } from './email-info.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateEmailInfoModel, UpdateEmailInfoModel, DeleteEmailInfoModel, GetEmailInfoModel, GetAllEmailInfoModel, GetEmailInfoByIdModel, CompanyIdRequestModel, EmailStatsResponseModel } from '@adminvault/shared-models';

@ApiTags('Email Management')
@Controller('email-info')
@UseGuards(JwtAuthGuard)
export class EmailInfoController {
    constructor(private readonly service: EmailInfoService) { }

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

    @Post('getAllEmailInfo')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllEmailInfo(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllEmailInfoModel> {
        try { 
            return await this.service.getAllEmailInfo(reqModel.id); 
         } catch (error) { 
            return returnException(GetAllEmailInfoModel, error); 
         }
    }

    @Post('getEmailStats')
    @ApiBody({ type: CompanyIdRequestModel })
    async getEmailStats(@Body() reqModel: CompanyIdRequestModel): Promise<EmailStatsResponseModel> {
        try { 
            return await this.service.getEmailStats(reqModel.id); 
         } catch (error) { 
            return returnException(EmailStatsResponseModel, error); 
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
