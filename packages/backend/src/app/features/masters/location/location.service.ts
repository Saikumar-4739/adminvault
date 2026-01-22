import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LocationRepository } from './repositories/location.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateLocationModel, UpdateLocationModel, GetAllLocationsResponseModel, CreateLocationResponseModel, UpdateLocationResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { LocationsMasterEntity } from './entities/location.entity';
import { GenericTransactionManager } from '../../../../database/typeorm-transactions';

@Injectable()
export class LocationService {
    constructor(
        private dataSource: DataSource,
        private locationRepo: LocationRepository
    ) { }

    async getAllLocations(reqModel: CompanyIdRequestModel): Promise<GetAllLocationsResponseModel> {
        try {
            const locations = await this.locationRepo.find();
            return new GetAllLocationsResponseModel(true, 200, 'Locations retrieved successfully', locations);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Locations');
        }
    }

    async createLocation(data: CreateLocationModel, userId?: number, ipAddress?: string): Promise<CreateLocationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationsMasterEntity);
            const newItem = repo.create({
                userId: data.userId,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                address: data.address,
                city: data.city,
                country: data.country
            });
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();

            return new CreateLocationResponseModel(true, 201, 'Location created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Location');
        }
    }

    async updateLocation(data: UpdateLocationModel, userId?: number, ipAddress?: string): Promise<UpdateLocationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.locationRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Location not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationsMasterEntity);
            await repo.save({
                id: data.id,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                address: data.address,
                city: data.city,
                country: data.country
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated location');
            }
            await transManager.completeTransaction();

            return new UpdateLocationResponseModel(true, 200, 'Location updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Location');
        }
    }

    async deleteLocation(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } });
            if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Location deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Location');
        }
    }
}
