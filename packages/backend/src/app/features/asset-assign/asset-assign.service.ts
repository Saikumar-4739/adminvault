import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetAssignEntity } from '../../entities/asset-assign.entity';
import { AssetAssignRepository } from '../../repository/asset-assign.repository';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';
import { ErrorResponse, GlobalResponse } from '@adminvault/backend-utils';
import { CreateAssetAssignModel, UpdateAssetAssignModel, DeleteAssetAssignModel, GetAssetAssignModel, GetAssetAssignByIdModel, AssetAssignResponseModel, GetAllAssetAssignsModel, AssetStatusEnum } from '@adminvault/shared-models';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AssetAssignService {
    constructor(
        private dataSource: DataSource,
        private assetAssignRepo: AssetAssignRepository,
        private auditLogsService: AuditLogsService
    ) { }

    /**
     * Create a new asset assignment
     * Assigns an asset to an employee with assignment details
     * 
     * @param reqModel - Asset assignment creation data
     * @returns GlobalResponse indicating success or failure
     * @throws ErrorResponse if validation fails or assignment creation fails
     */
    async createAssignment(reqModel: CreateAssetAssignModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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
            const newAssetAssign = new AssetAssignEntity();
            newAssetAssign.assetId = reqModel.assetId;
            newAssetAssign.employeeId = reqModel.employeeId;
            newAssetAssign.assignedById = reqModel.assignedById;
            newAssetAssign.assignedDate = reqModel.assignedDate;
            newAssetAssign.userId = reqModel.employeeId;
            await transManager.getRepository(AssetAssignEntity).save(newAssetAssign);

            // Update asset status to IN_USE and set assigned employee
            await transManager.getRepository(AssetInfoEntity).update(reqModel.assetId, {
                assetStatusEnum: AssetStatusEnum.IN_USE,
                assignedToEmployeeId: reqModel.employeeId,
                userAssignedDate: reqModel.assignedDate
            });

            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'ASSIGN_ASSET',
                resource: 'AssetAssign',
                details: `Asset ${reqModel.assetId} assigned to Employee ${reqModel.employeeId}`,
                status: 'SUCCESS',
                userId: userId || reqModel.assignedById || undefined,
                companyId: 0, // Ideally fetch from user context
                ipAddress: ipAddress || '0.0.0.0'
            });

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
    async updateAssignment(reqModel: UpdateAssetAssignModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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
            const updatedAssetAssign = new AssetAssignEntity();
            updatedAssetAssign.id = reqModel.id;
            updatedAssetAssign.assetId = reqModel.assetId;
            updatedAssetAssign.employeeId = reqModel.employeeId;
            updatedAssetAssign.assignedById = reqModel.assignedById;
            updatedAssetAssign.assignedDate = reqModel.assignedDate;
            updatedAssetAssign.userId = reqModel.employeeId;
            await transManager.getRepository(AssetAssignEntity).update(reqModel.id, updatedAssetAssign);

            // Update asset's assigned employee if it changed
            if (existing.employeeId !== reqModel.employeeId || existing.assetId !== reqModel.assetId) {
                await transManager.getRepository(AssetInfoEntity).update(reqModel.assetId, {
                    assignedToEmployeeId: reqModel.employeeId,
                    userAssignedDate: reqModel.assignedDate
                });
            }

            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'UPDATE_ASSIGNMENT',
                resource: 'AssetAssign',
                details: `Assignment ${reqModel.id} updated`,
                status: 'SUCCESS',
                userId: userId || reqModel.assignedById || undefined,
                companyId: 0,
                ipAddress: ipAddress || '0.0.0.0'
            });

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
    async deleteAssignment(reqModel: DeleteAssetAssignModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
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

            // Get the assignment to know which asset to update
            const assignment = await this.assetAssignRepo.findOne({ where: { id: reqModel.id } });
            if (assignment) {
                // Update asset status back to AVAILABLE and clear assignment
                await transManager.getRepository(AssetInfoEntity).update(assignment.assetId, {
                    assetStatusEnum: AssetStatusEnum.AVAILABLE,
                    previousUserEmployeeId: assignment.employeeId,
                    assignedToEmployeeId: null as any,
                    lastReturnDate: new Date()
                });
            }

            await transManager.getRepository(AssetAssignEntity).softDelete(reqModel.id);
            await transManager.completeTransaction();

            // AUDIT LOG
            await this.auditLogsService.create({
                action: 'DELETE_ASSIGNMENT',
                resource: 'AssetAssign',
                details: `Assignment ${reqModel.id} deleted (Returned)`,
                status: 'SUCCESS',
                userId: userId || undefined,
                companyId: 0,
                ipAddress: ipAddress || '0.0.0.0'
            });

            return new GlobalResponse(true, 0, "Assignment deleted successfully");
        } catch (error) {
            await transManager.releaseTransaction();
            throw error;
        }
    }
}
