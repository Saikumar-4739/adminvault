import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SlackUsersRepository } from './repositories/slack-user.repository';
import { EmployeesRepository } from '../../employees/repositories/employees.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateSlackUserModel, UpdateSlackUserModel, GetAllSlackUsersResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { SlackUsersMasterEntity } from './entities/slack-user.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';

@Injectable()
export class SlackUserService {
    constructor(
        private dataSource: DataSource,
        private slackUserRepo: SlackUsersRepository,
        private employeeRepo: EmployeesRepository,
        private companyRepo: CompanyInfoRepository
    ) { }


    async createSlackUser(reqModel: CreateSlackUserModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {

            const companyInfo = await this.companyRepo.findOne({ where: { id: reqModel.companyId } });
            if (!companyInfo)
                throw new ErrorResponse(400, 'Invalid Company ID or Company does not exist');

            const empInfo = await this.employeeRepo.findOne({ where: { id: reqModel.employeeId, companyId: reqModel.companyId } });
            if (!empInfo) {
                throw new ErrorResponse(400, 'Invalid Employee ID or Employee does not belong to the Company');
            }

            await transManager.startTransaction();
            const saveEntity = new SlackUsersMasterEntity();
            saveEntity.companyId = reqModel.companyId;
            saveEntity.employeeId = empInfo.id;
            saveEntity.isActive = true;
            saveEntity.name = reqModel.name;
            saveEntity.email = reqModel.email;
            saveEntity.slackUserId = reqModel.slackUserId;
            saveEntity.displayName = reqModel.displayName;
            saveEntity.role = reqModel.role;
            saveEntity.department = reqModel.department;
            saveEntity.phone = reqModel.phone;
            saveEntity.notes = reqModel.notes;
            saveEntity.userId = reqModel.userId;
            await transManager.getRepository(SlackUsersMasterEntity).save(saveEntity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, 'Slack User created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAllSlackUsers(): Promise<GetAllSlackUsersResponseModel> {
        try {
            const users = await this.slackUserRepo.find();
            return new GetAllSlackUsersResponseModel(true, 200, 'Slack Users retrieved successfully', users as any);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Slack Users');
        }
    }

    async updateSlackUser(reqModel: UpdateSlackUserModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.slackUserRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Slack User not found');
            }

            await transManager.startTransaction();
            await transManager.getRepository(SlackUsersMasterEntity).update(reqModel.id, { name: reqModel.name, email: reqModel.email, slackUserId: reqModel.slackUserId, displayName: reqModel.displayName, role: reqModel.role, department: reqModel.department, phone: reqModel.phone, notes: reqModel.notes, isActive: reqModel.isActive, employeeId: reqModel.employeeId });
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Slack User updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteSlackUser(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.slackUserRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Slack User not found');
            }

            await transManager.startTransaction();
            await transManager.getRepository(SlackUsersMasterEntity).delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Slack User deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
