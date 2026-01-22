import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SlackUserService } from './slack-user.service';
import { CreateSlackUserModel, UpdateSlackUserModel, GetAllSlackUsersResponseModel, CreateSlackUserResponseModel, UpdateSlackUserResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';

@ApiTags('Slack Users Master')
@Controller('masters')
@UseGuards(JwtAuthGuard)
export class SlackUserController {
    constructor(private slackUserService: SlackUserService) { }

    @Post('getAllSlackUsers')
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllSlackUsers(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllSlackUsersResponseModel> {
        try {
            return await this.slackUserService.getAllSlackUsers(reqModel);
        } catch (error) {
            return returnException(GetAllSlackUsersResponseModel, error);
        }
    }

    @Post('createSlackUser')
    @ApiBody({ type: CreateSlackUserModel })
    async createSlackUser(@Body() data: CreateSlackUserModel, @Req() req: any): Promise<CreateSlackUserResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.slackUserService.createSlackUser(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateSlackUserResponseModel, error);
        }
    }

    @Post('updateSlackUser')
    @ApiBody({ type: UpdateSlackUserModel })
    async updateSlackUser(@Body() data: UpdateSlackUserModel, @Req() req: any): Promise<UpdateSlackUserResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.slackUserService.updateSlackUser(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateSlackUserResponseModel, error);
        }
    }

    @Post('deleteSlackUser')
    @ApiBody({ type: IdRequestModel })
    async deleteSlackUser(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.slackUserService.deleteSlackUser(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
