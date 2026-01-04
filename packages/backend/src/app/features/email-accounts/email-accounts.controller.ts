import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { EmailAccountsService } from './email-accounts.service';
import {
    CreateEmailAccountModel,
    DeleteEmailAccountModel,
    GetAllEmailAccountsModel
} from '@adminvault/shared-models';

@ApiTags('Email Accounts')
@Controller('email-accounts')
export class EmailAccountsController {
    constructor(private readonly service: EmailAccountsService) { }

    /**
     * Retrieve all email accounts
     * @returns GetAllEmailAccountsModel with email account data
     */
    @Post('findAll')
    async findAll(): Promise<GetAllEmailAccountsModel> {
        try {
            return await this.service.findAll();
        } catch (error) {
            return returnException(GetAllEmailAccountsModel, error);
        }
    }

    /**
     * Create a new email account configuration
     * @param reqModel - Email account creation data
     * @returns GlobalResponse indicating creation success
     */
    @Post('create')
    @ApiBody({ type: CreateEmailAccountModel })
    async create(@Body() reqModel: CreateEmailAccountModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.create(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    /**
     * Delete an email account configuration
     * @param reqModel - Delete request with email account ID
     * @returns GlobalResponse indicating deletion success
     */
    @Post('delete')
    @ApiBody({ type: DeleteEmailAccountModel })
    async remove(@Body() reqModel: DeleteEmailAccountModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.service.delete(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
