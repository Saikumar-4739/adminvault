import { Injectable } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { ApplicationRepository } from './repositories/application.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateApplicationModel, UpdateApplicationModel, GetAllApplicationsResponseModel, CreateApplicationResponseModel, UpdateApplicationResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { ApplicationsMasterEntity } from './entities/application.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class ApplicationService {
    constructor(
        private dataSource: DataSource,
        private appRepo: ApplicationRepository
    ) { }


    async createApplication(reqModel: CreateApplicationModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(ApplicationsMasterEntity);

            if (!reqModel.name) {
                throw new ErrorResponse(0, "Application name is required");
            }

            const existingName = await repo.findOne({ where: { name: reqModel.name } });
            if (existingName) {
                throw new ErrorResponse(0, "Application with this name already exists");
            }

            if (reqModel.code) {
                const existingCode = await repo.findOne({ where: { code: reqModel.code } });
                if (existingCode) {
                    throw new ErrorResponse(0, "Application code already in use");
                }
            }

            const newApp = new ApplicationsMasterEntity();
            newApp.userId = reqModel.userId;
            newApp.name = reqModel.name;
            newApp.description = reqModel.description;
            newApp.isActive = reqModel.isActive;
            newApp.ownerName = reqModel.ownerName;
            newApp.ownerName = reqModel.ownerName;

            if (reqModel.appReleaseDate) {
                const date = new Date(reqModel.appReleaseDate);
                if (!isNaN(date.getTime())) {
                    reqModel.appReleaseDate = date.toISOString().split('T')[0] as any;
                }
            }

            newApp.appReleaseDate = reqModel.appReleaseDate;
            newApp.code = reqModel.code;
            await transManager.getRepository(ApplicationsMasterEntity).save(newApp);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 201, 'Application created successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
    async getAllApplications(): Promise<GetAllApplicationsResponseModel> {
        try {
            const applications = await this.appRepo.find();
            return new GetAllApplicationsResponseModel(true, 200, 'Applications retrieved successfully', applications);
        } catch (error) {
            throw error;
        }
    }

    async updateApplication(reqModel: UpdateApplicationModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.appRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Application not found');
            }

            await transManager.startTransaction();
            const transRepo = transManager.getRepository(ApplicationsMasterEntity);

            if (reqModel.name !== undefined && reqModel.name.trim() === '') {
                throw new ErrorResponse(0, 'Application name cannot be empty');
            }

            if (reqModel.code) {
                const codeExists = await this.appRepo.findOne({ where: { code: reqModel.code, id: Not(reqModel.id) } });
                if (codeExists) {
                    throw new ErrorResponse(0, 'Application code already in use');
                }
            }

            if (reqModel.appReleaseDate) {
                const date = new Date(reqModel.appReleaseDate);
                if (!isNaN(date.getTime())) {
                    reqModel.appReleaseDate = date.toISOString().split('T')[0] as any;
                }
            }

            await transManager.getRepository(ApplicationsMasterEntity).update(reqModel.id, { name: reqModel.name, description: reqModel.description, isActive: reqModel.isActive, ownerName: reqModel.ownerName, appReleaseDate: reqModel.appReleaseDate, code: reqModel.code });
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Application updated successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteApplication(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(ApplicationsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Application deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

}
