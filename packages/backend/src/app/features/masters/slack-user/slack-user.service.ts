import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { SlackUsersRepository } from './repositories/slack-user.repository';
import { EmployeesRepository } from '../../employees/repositories/employees.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateSlackUserModel, UpdateSlackUserModel, GetAllSlackUsersResponseModel, IdRequestModel } from '@adminvault/shared-models';
import { SlackUsersMasterEntity } from './entities/slack-user.entity';
import { EmployeesEntity } from '../../employees/entities/employees.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';
import { CompanyInfoRepository } from '../company-info/repositories/company-info.repository';
import { CompanyInfoEntity } from '../company-info/entities/company-info.entity';

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

            const companyInfo = await this.companyRepo.findOne({ where: { id: reqModel.id } });
            if (!companyInfo)
                throw new ErrorResponse(400, 'Invalid Company ID or Company does not exist');

            const empInfo = await this.employeeRepo.findOne({ where: { id: reqModel.employeeId, companyId: reqModel.id } });
            if (!empInfo) {
                throw new ErrorResponse(400, 'Invalid Employee ID or Employee does not belong to the Company');
            }

            await transManager.startTransaction();
            const saveEntity = new SlackUsersMasterEntity();
            saveEntity.companyId = reqModel.id;
            saveEntity.employeeId = empInfo.id;
            saveEntity.isActive = reqModel.isActive ?? true;
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

            // Sync with Employee Table
            if (empInfo) {
                empInfo.slackUserId = reqModel.slackUserId;
                empInfo.slackDisplayName = reqModel.displayName;
                empInfo.slackAvatar = reqModel.avatar;
                empInfo.isSlackActive = reqModel.isActive;
                await transManager.getRepository(EmployeesEntity).save(empInfo);
            }

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

            // Fetch company names separately
            const companyIds = [...new Set(users.map(u => Number(u.companyId)).filter(Boolean))];
            const companies = companyIds.length > 0
                ? await this.dataSource.getRepository(CompanyInfoEntity).find({ where: { id: In(companyIds) } })
                : [];
            const companyMap = new Map<number, string>();
            companies.forEach(c => companyMap.set(Number(c.id), c.companyName));

            const mappedUsers = users.map(u => ({
                ...u,
                companyName: companyMap.get(Number(u.companyId)) || null
            }));
            return new GetAllSlackUsersResponseModel(true, 200, 'Slack Users retrieved successfully', mappedUsers as any);
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

            // Sync with Employee Table
            const targetEmployeeId = reqModel.employeeId || existing.employeeId;
            if (targetEmployeeId) {
                const empInfo = await transManager.getRepository(EmployeesEntity).findOne({ where: { id: targetEmployeeId } });
                if (empInfo) {
                    empInfo.slackUserId = reqModel.slackUserId;
                    empInfo.slackDisplayName = reqModel.displayName;
                    // empInfo.slackAvatar = reqModel.avatar; // Update model might not have avatar in the update object above, let's check
                    empInfo.isSlackActive = reqModel.isActive;
                    // Avatar is in the model but not in the update object in the original code? 
                    // Let's check CreateSlackUserModel vs UpdateSlackUserModel
                    if (reqModel.avatar) empInfo.slackAvatar = reqModel.avatar;

                    await transManager.getRepository(EmployeesEntity).save(empInfo);
                }
            }

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
