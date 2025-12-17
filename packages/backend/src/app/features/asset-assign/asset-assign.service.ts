import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetAssignRepository } from '../../repository/asset-assign.repository';
import { AssetAssignEntity } from '../../entities/asset-assign.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAllAssetAssignsModel, GetAssetAssignByIdModel, AssetAssignResponseModel } from '@adminvault/shared-models';

@Injectable()
export class AssetAssignService {
    constructor(
        private dataSource: DataSource,
        private assetAssignRepo: AssetAssignRepository
    ) { }

    async createAssignment(reqModel: CreateAssetAssignModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.assetId) {
                throw new ErrorResponse(0, "Asset ID is required");
            }

            if (!reqModel.employeeId) {
                throw new ErrorResponse(0, "Employee ID is required");
            }

            if (!reqModel.assignedById) {
                throw new ErrorResponse(0, "Assigned by ID is required");
            }

            if (!reqModel.assignedDate) {
                throw new ErrorResponse(0, "Assigned date is required");
            }

            await transManager.startTransaction();
            const entity = this.assetAssignRepo.create(reqModel);
            await transManager.getRepository(AssetAssignEntity).save(entity);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Asset assigned successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async updateAssignment(reqModel: UpdateAssetAssignModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Assignment ID is required");
            }
            const existing = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Assignment not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(AssetAssignEntity).update(reqModel.id, reqModel);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Assignment updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    async getAssignment(reqModel: GetAssetAssignModel): Promise<GetAssetAssignByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Assignment ID is required");
            }
            const assignment = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (!assignment) {
                throw new ErrorResponse(0, "Assignment not found");
            }

            const response = new AssetAssignResponseModel(assignment.id, assignment.assetId, assignment.employeeId, assignment.assignedById, assignment.assignedDate, assignment.returnDate, assignment.remarks);
            return new GetAssetAssignByIdModel(true, 0, "Assignment retrieved successfully", response);
        } catch (error) {
            throw error;
        }
    }

    async getAllAssignments(): Promise<GetAllAssetAssignsModel> {
        try {
            const assignments = await this.assetAssignRepo.find();
            const responses = assignments.map(a => new AssetAssignResponseModel(a.id, a.assetId, a.employeeId, a.assignedById, a.assignedDate, a.returnDate, a.remarks));
            return new GetAllAssetAssignsModel(true, 0, "Assignments retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    async deleteAssignment(reqModel: DeleteAssetAssignModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Assignment ID is required");
            }
            const existing = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Assignment not found");
            }

            await transManager.startTransaction();
            await transManager.getRepository(AssetAssignEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Assignment deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
