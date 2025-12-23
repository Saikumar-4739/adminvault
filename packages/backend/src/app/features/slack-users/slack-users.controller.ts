import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { SlackUsersService } from './slack-users.service';
import {
    CreateSlackUserModel, UpdateSlackUserModel, DeleteSlackUserModel,
    GetSlackUserModel, GetAllSlackUsersModel, GetSlackUserByIdModel
} from '@adminvault/shared-models';

@ApiTags('Slack Users')
@Controller('slack-users')
export class SlackUsersController {
    constructor(private service: SlackUsersService) { }

    @Post('create')
    @ApiBody({ type: CreateSlackUserModel })
    async createSlackUser(@Body() reqModel: CreateSlackUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.createSlackUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('update')
    @ApiBody({ type: UpdateSlackUserModel })
    async updateSlackUser(@Body() reqModel: UpdateSlackUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.updateSlackUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('delete')
    @ApiBody({ type: DeleteSlackUserModel })
    async deleteSlackUser(@Body() reqModel: DeleteSlackUserModel): Promise<GlobalResponse> {
        try {
            return await this.service.deleteSlackUser(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    @Post('get')
    @ApiBody({ type: GetSlackUserModel })
    async getSlackUser(@Body() reqModel: GetSlackUserModel): Promise<GetSlackUserByIdModel> {
        try {
            return await this.service.getSlackUser(reqModel);
        } catch (error) {
            return returnException(GetSlackUserByIdModel, error);
        }
    }

    @Post('getAll')
    @ApiQuery({ name: 'companyId', required: false, type: Number })
    async getAllSlackUsers(@Query('companyId') companyId?: number): Promise<GetAllSlackUsersModel> {
        try {
            return await this.service.getAllSlackUsers(companyId);
        } catch (error) {
            return returnException(GetAllSlackUsersModel, error);
        }
    }
}
