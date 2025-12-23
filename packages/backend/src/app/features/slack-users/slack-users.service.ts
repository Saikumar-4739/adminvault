import { Injectable } from '@nestjs/common';
import { SlackUserRepository } from '../../repository/slack-user.repository';
import {
    CreateSlackUserModel, UpdateSlackUserModel, DeleteSlackUserModel,
    GetSlackUserModel, GetAllSlackUsersModel, GetSlackUserByIdModel, SlackUserModel
} from '@adminvault/shared-models';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class SlackUsersService {
    constructor(private slackUserRepo: SlackUserRepository) { }

    async createSlackUser(reqModel: CreateSlackUserModel): Promise<GlobalResponse> {
        try {
            const existingUser = await this.slackUserRepo.findOne({
                where: { email: reqModel.email, companyId: reqModel.companyId }
            });

            if (existingUser) {
                throw new ErrorResponse(400, 'Slack user with this email already exists');
            }

            const slackUser = this.slackUserRepo.create({
                ...reqModel,
                userId: reqModel.userId,
                isActive: true
            });

            await this.slackUserRepo.save(slackUser);
            return new GlobalResponse(true, 201, 'Slack user created successfully');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to create Slack user');
        }
    }

    async updateSlackUser(reqModel: UpdateSlackUserModel): Promise<GlobalResponse> {
        try {
            const slackUser = await this.slackUserRepo.findOne({ where: { id: reqModel.id } });
            if (!slackUser) {
                throw new ErrorResponse(404, 'Slack user not found');
            }

            Object.assign(slackUser, reqModel);
            slackUser.userId = reqModel.userId;
            await this.slackUserRepo.save(slackUser);

            return new GlobalResponse(true, 200, 'Slack user updated successfully');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Slack user');
        }
    }

    async deleteSlackUser(reqModel: DeleteSlackUserModel): Promise<GlobalResponse> {
        try {
            const result = await this.slackUserRepo.delete(reqModel.id);
            if (result.affected === 0) {
                throw new ErrorResponse(404, 'Slack user not found');
            }
            return new GlobalResponse(true, 200, 'Slack user deleted successfully');
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to delete Slack user');
        }
    }

    async getSlackUser(reqModel: GetSlackUserModel): Promise<GetSlackUserByIdModel> {
        try {
            const slackUser = await this.slackUserRepo.findOne({ where: { id: reqModel.id } });
            if (!slackUser) {
                throw new ErrorResponse(404, 'Slack user not found');
            }
            return new GetSlackUserByIdModel(true, 200, 'Slack user retrieved successfully', slackUser as SlackUserModel);
        } catch (error) {
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to fetch Slack user');
        }
    }

    async getAllSlackUsers(companyId?: number): Promise<GetAllSlackUsersModel> {
        try {
            const where = companyId ? { companyId } : {};
            const slackUsers = await this.slackUserRepo.find({ where, order: { name: 'ASC' } });
            return new GetAllSlackUsersModel(true, 200, 'Slack users retrieved successfully', slackUsers as SlackUserModel[]);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Slack users');
        }
    }
}
