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

    async getAllApplications(): Promise<GetAllApplicationsResponseModel> {
        try {
            const applications = await this.appRepo.find();
            return new GetAllApplicationsResponseModel(true, 200, 'Applications retrieved successfully', applications);
        } catch (error) {
            throw error;
        }
    }

    async createApplication(data: CreateApplicationModel, userId?: number, ipAddress?: string): Promise<CreateApplicationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(ApplicationsMasterEntity);

            if (!data.name) {
                throw new ErrorResponse(0, "Application name is required");
            }

            const existingName = await repo.findOne({ where: { name: data.name } });
            if (existingName) {
                throw new ErrorResponse(0, "Application with this name already exists");
            }

            if (data.code) {
                const existingCode = await repo.findOne({ where: { code: data.code } });
                if (existingCode) {
                    throw new ErrorResponse(0, "Application code already in use");
                }
            }

            const formattedDate = data.appReleaseDate
                ? new Date(data.appReleaseDate).toISOString().split('T')[0]
                : null;

            const newApp = repo.create({
                userId: data.userId,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                ownerName: data.ownerName,
                appReleaseDate: formattedDate as any,
                code: data.code
            });
            const saved = await repo.save(newApp);
            await transManager.completeTransaction();

            return new CreateApplicationResponseModel(true, 201, 'Application created successfully', saved);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateApplication(data: UpdateApplicationModel, userId?: number, ipAddress?: string): Promise<UpdateApplicationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.appRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Application not found');
            }

            await transManager.startTransaction();
            const transRepo = transManager.getRepository(ApplicationsMasterEntity);

            if (data.name !== undefined && data.name.trim() === '') {
                throw new ErrorResponse(0, 'Application name cannot be empty');
            }

            if (data.code) {
                const codeExists = await this.appRepo.findOne({ where: { code: data.code, id: Not(data.id) } });
                if (codeExists) {
                    throw new ErrorResponse(0, 'Application code already in use');
                }
            }

            const formattedDate = data.appReleaseDate
                ? new Date(data.appReleaseDate).toISOString().split('T')[0]
                : null;

            await transRepo.update(data.id, {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                ownerName: data.ownerName,
                appReleaseDate: formattedDate as any,
                code: data.code
            });
            const updated = await transRepo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated application');
            }
            await transManager.completeTransaction();

            return new UpdateApplicationResponseModel(true, 200, 'Application updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async deleteApplication(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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
