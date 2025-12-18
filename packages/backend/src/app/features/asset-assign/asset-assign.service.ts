import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetAssignEntity } from '../../entities/asset-assign.entity';
import { AssetAssignRepository } from '../../repository/asset-assign.repository';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAssetAssignByIdModel, AssetAssignResponseModel, GetAllAssetAssignsModel } from '@adminvault/shared-models';

@Injectable()
export class AssetAssignService {
    constructor(
        private dataSource: DataSource,
        private assetAssignRepo: AssetAssignRepository
    ) { }

    /**
     * Create a new asset assignment
     * Assigns an asset to an employee with assignment details
     * 
     * @param reqModel - Asset assignment creation data
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if validation fails or assignment creation fails
     */
    async createAssignment(reqModel: CreateAssetAssignModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            // Validate required fields
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

            // Create new assignment entity
            const newAssetAssign = new AssetAssignEntity();
            newAssetAssign.assetId = reqModel.assetId;
            newAssetAssign.employeeId = reqModel.employeeId;
            newAssetAssign.assignedById = reqModel.assignedById;
            newAssetAssign.assignedDate = reqModel.assignedDate;
            newAssetAssign.userId = reqModel.employeeId; // Track who created this record

            await transManager.getRepository(AssetAssignEntity).save(newAssetAssign);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 0, "Asset assigned successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Update an existing asset assignment
     * Modifies assignment details for an existing asset-employee assignment
     * 
     * @param reqModel - Asset assignment update data
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if assignment not found or update fails
     */
    async updateAssignment(reqModel: UpdateAssetAssignModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            // Validate assignment exists
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Assignment ID is required");
            }

            const existing = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Assignment not found");
            }

            await transManager.startTransaction();

            // Update assignment entity
            const updatedAssetAssign = new AssetAssignEntity();
            updatedAssetAssign.id = reqModel.id;
            updatedAssetAssign.assetId = reqModel.assetId;
            updatedAssetAssign.employeeId = reqModel.employeeId;
            updatedAssetAssign.assignedById = reqModel.assignedById;
            updatedAssetAssign.assignedDate = reqModel.assignedDate;
            updatedAssetAssign.userId = reqModel.employeeId;

            await transManager.getRepository(AssetAssignEntity).update(reqModel.id, updatedAssetAssign);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 0, "Assignment updated successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }

    /**
     * Get a specific asset assignment by ID
     * Retrieves detailed information about a single assignment
     * 
     * @param reqModel - Request model containing assignment ID
     * @returns GetAssetAssignByIdModel with assignment details
     * @throws ErrorResponse if assignment not found
     */
    async getAssignment(reqModel: GetAssetAssignModel): Promise<GetAssetAssignByIdModel> {
        try {
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Assignment ID is required");
            }

            const assignment = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (!assignment) {
                throw new ErrorResponse(0, "Assignment not found");
            }

            const response = new AssetAssignResponseModel(
                assignment.id,
                assignment.assetId,
                assignment.employeeId,
                assignment.assignedById,
                assignment.assignedDate,
                assignment.returnDate,
                assignment.remarks
            );

            return new GetAssetAssignByIdModel(true, 0, "Assignment retrieved successfully", response);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all asset assignments
     * Retrieves a list of all asset-employee assignments in the system
     * 
     * @returns GetAllAssetAssignsModel with list of all assignments
     * @throws Error if retrieval fails
     */
    async getAllAssignments(): Promise<GetAllAssetAssignsModel> {
        try {
            const assignments = await this.assetAssignRepo.find();
            const responses = assignments.map(a => new AssetAssignResponseModel(a.id, a.assetId, a.employeeId, a.assignedById, a.assignedDate, a.returnDate, a.remarks));
            return new GetAllAssetAssignsModel(true, 0, "Assignments retrieved successfully", responses);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete an asset assignment (soft delete)
     * Marks an assignment as deleted without removing from database
     * 
     * @param reqModel - Request model containing assignment ID to delete
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if assignment not found or deletion fails
     */
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
