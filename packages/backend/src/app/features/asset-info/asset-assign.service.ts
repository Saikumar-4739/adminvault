import { Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { AssetAssignEntity } from './entities/asset-assign.entity';
import { AssetAssignRepository } from './repositories/asset-assign.repository';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAssetAssignByIdModel, AssetAssignResponseModel, GetAllAssetAssignsModel, AssetStatusEnum } from '@adminvault/shared-models';
import { AssetInfoEntity } from './entities/asset-info.entity';

@Injectable()
export class AssetAssignService {
    constructor(
        private dataSource: DataSource,
        private assetAssignRepo: AssetAssignRepository,
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
            if (!reqModel.assetId || !reqModel.employeeId || !reqModel.assignedById || !reqModel.assignedDate) {
                throw new ErrorResponse(0, "Asset ID, Employee ID, Assign By ID and Assigned Date are required");
            }
            await transManager.startTransaction();
            const newAssetAssign = new AssetAssignEntity();
            newAssetAssign.assetId = reqModel.assetId;
            newAssetAssign.employeeId = reqModel.employeeId;
            newAssetAssign.assignedById = reqModel.assignedById;
            newAssetAssign.assignedDate = reqModel.assignedDate;
            newAssetAssign.userId = reqModel.employeeId;
            await transManager.getRepository(AssetAssignEntity).save(newAssetAssign);
            await transManager.getRepository(AssetInfoEntity).update(reqModel.assetId, { assetStatusEnum: AssetStatusEnum.IN_USE, assignedToEmployeeId: reqModel.employeeId, userAssignedDate: reqModel.assignedDate });
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
            if (!reqModel.id) {
                throw new ErrorResponse(0, "Assignment ID is required");
            }

            const existing = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(0, "Assignment not found");
            }

            await transManager.startTransaction();
            const updatedAssetAssign = new AssetAssignEntity();
            updatedAssetAssign.id = reqModel.id;
            updatedAssetAssign.assetId = reqModel.assetId;
            updatedAssetAssign.employeeId = reqModel.employeeId;
            updatedAssetAssign.assignedById = reqModel.assignedById;
            updatedAssetAssign.assignedDate = reqModel.assignedDate;
            updatedAssetAssign.userId = reqModel.employeeId;
            await transManager.getRepository(AssetAssignEntity).update(reqModel.id, updatedAssetAssign);

            if (existing.assetId !== reqModel.assetId) {
                // Asset changed: release old asset
                await transManager.getRepository(AssetInfoEntity).update(existing.assetId, { 
                    assetStatusEnum: AssetStatusEnum.AVAILABLE, 
                    previousUserEmployeeId: existing.employeeId,
                    assignedToEmployeeId: null as any,
                    lastReturnDate: new Date()
                });
                // Update new asset
                await transManager.getRepository(AssetInfoEntity).update(reqModel.assetId, { 
                    assetStatusEnum: AssetStatusEnum.IN_USE, 
                    assignedToEmployeeId: reqModel.employeeId, 
                    userAssignedDate: reqModel.assignedDate 
                });
            } else if (existing.employeeId !== reqModel.employeeId) {
                // Same asset, different employee
                await transManager.getRepository(AssetInfoEntity).update(reqModel.assetId, { 
                    assignedToEmployeeId: reqModel.employeeId, 
                    userAssignedDate: reqModel.assignedDate 
                });
            }

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

            const response = new AssetAssignResponseModel(assignment.id, assignment.assetId, assignment.employeeId, assignment.assignedById, assignment.assignedDate, assignment.returnDate, assignment.remarks);
            return new GetAssetAssignByIdModel(true, 0, "Assignment retrieved successfully", response);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all asset assignments
     * Retrieves a list of all asset-employee assignments in the system
     * 
     * @param companyId - Optional company ID to filter assignments
     * @returns GetAllAssetAssignsModel with list of all assignments
     * @throws Error if retrieval fails
     */
    async getAllAssignments(companyId?: number): Promise<GetAllAssetAssignsModel> {
        try {
            const assignments = await this.assetAssignRepo.getAllAssignments(companyId);
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
            const assignment = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (assignment) {
                // Update asset status back to AVAILABLE and clear assignment
                await transManager.getRepository(AssetInfoEntity).update(assignment.assetId, { assetStatusEnum: AssetStatusEnum.AVAILABLE, previousUserEmployeeId: assignment.employeeId, assignedToEmployeeId: null as any, lastReturnDate: new Date() });
            }
            await transManager.getRepository(AssetAssignEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 0, "Assignment deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
