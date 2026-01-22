import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SlackUsersRepository } from './repositories/slack-user.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateSlackUserModel, UpdateSlackUserModel, GetAllSlackUsersResponseModel, CreateSlackUserResponseModel, UpdateSlackUserResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { SlackUsersMasterEntity } from './entities/slack-user.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class SlackUserService {
    constructor(
        private dataSource: DataSource,
        private slackUserRepo: SlackUsersRepository
    ) { }

    async getAllSlackUsers(reqModel: CompanyIdRequestModel): Promise<GetAllSlackUsersResponseModel> {
        try {
            const users = await this.slackUserRepo.find();
            return new GetAllSlackUsersResponseModel(true, 200, 'Slack Users retrieved successfully', users as any);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Slack Users');
        }
    }

    async createSlackUser(data: CreateSlackUserModel, userId?: number, ipAddress?: string): Promise<CreateSlackUserResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(SlackUsersMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create({
                ...createData,
                isActive: true
            });
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateSlackUserResponseModel(true, 201, 'Slack User created successfully', savedItem as any);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Slack User');
        }
    }

    async updateSlackUser(data: UpdateSlackUserModel, userId?: number, ipAddress?: string): Promise<UpdateSlackUserResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.slackUserRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Slack User not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(SlackUsersMasterEntity);
            await repo.save({
                id: data.id,
                name: data.name,
                email: data.email,
                slackUserId: data.slackUserId,
                displayName: data.displayName,
                role: data.role,
                department: data.department,
                phone: data.phone,
                notes: data.notes,
                isActive: data.isActive,
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            await transManager.completeTransaction();

            if (!updated) throw new Error('Failed to retrieve updated user');

            return new UpdateSlackUserResponseModel(true, 200, 'Slack User updated successfully', updated as any);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Slack User');
        }
    }

    async deleteSlackUser(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.slackUserRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Slack User not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(SlackUsersMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Slack User deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Slack User');
        }
    }
}
