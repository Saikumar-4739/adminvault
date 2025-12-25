import { Body, Controller, Param, Post } from '@nestjs/common';
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
    async create(@Body() reqModel: CreateEmailAccountModel): Promise<GlobalResponse> {
        try {
            return await this.service.create(reqModel);
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
    async remove(@Body() reqModel: DeleteEmailAccountModel): Promise<GlobalResponse> {
        try {
            return await this.service.delete(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
