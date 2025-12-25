import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AssetInfoRepository } from '../../repository/asset-info.repository';
import { AssetReturnHistoryRepository } from '../../repository/asset-return-history.repository';
import { AssetNextAssignmentRepository } from '../../repository/asset-next-assignment.repository';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { AssetReturnHistoryEntity } from '../../entities/asset-return-history.entity';
import { AssetNextAssignmentEntity } from '../../entities/asset-next-assignment.entity';
import { ErrorResponse } from '@adminvault/backend-utils';
import {
    GetStoreAssetsRequestModel, GetStoreAssetsResponseModel, StoreAssetModel,
    GetReturnAssetsRequestModel, GetReturnAssetsResponseModel, ReturnAssetModel,
    ProcessReturnRequestModel, ProcessReturnResponseModel,
    GetNextAssignmentsRequestModel, GetNextAssignmentsResponseModel, NextAssignmentModel,
    CreateNextAssignmentRequestModel, CreateNextAssignmentResponseModel,
    AssignFromQueueRequestModel, AssignFromQueueResponseModel,
    AssetStatusEnum, NextAssignmentStatus, AssignmentPriority,
    NextAssignmentStatusEnum, AssignmentPriorityEnum
} from '@adminvault/shared-models';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';

@Injectable()
export class AssetTabsService {
    constructor(
        private dataSource: DataSource,
        private assetInfoRepo: AssetInfoRepository,
        private returnHistoryRepo: AssetReturnHistoryRepository,
        private nextAssignmentRepo: AssetNextAssignmentRepository
    ) { }

    // ============================================
    // STORE ASSETS TAB
    // ============================================
    async getStoreAssets(reqModel: GetStoreAssetsRequestModel): Promise<GetStoreAssetsResponseModel> {
        try {
            // Get all assets that are available/in storage (not assigned)
            const query = this.dataSource
                .createQueryBuilder(AssetInfoEntity, 'asset')
                .leftJoinAndSelect('device_info', 'device', 'asset.deviceId = device.id')
                .leftJoinAndSelect('device_brands', 'brand', 'asset.brandId = brand.id')
                .leftJoinAndSelect('employees', 'pastUser', 'asset.previousUserEmployeeId = pastUser.id')
                .leftJoinAndSelect('employees', 'presentUser', 'asset.assignedToEmployeeId = presentUser.id')
                .where('asset.companyId = :companyId', { companyId: reqModel.companyId })
                .andWhere('(asset.assetStatusEnum = :available OR asset.assetStatusEnum = :maintenance)', {
                    available: AssetStatusEnum.AVAILABLE,
                    maintenance: AssetStatusEnum.MAINTENANCE
                })
                .select([
                    'asset.id as id',
                    'device.name as deviceName',
                    'asset.configuration as configuration',
                    'asset.serialNumber as serialNumber',
                    'asset.expressCode as expressCode',
                    'asset.boxNo as boxNo',
                    'CONCAT(pastUser.firstName, " ", pastUser.lastName) as pastUserName',
                    'CONCAT(presentUser.firstName, " ", presentUser.lastName) as presentUserName',
                    'asset.assetStatusEnum as assetStatusEnum',
                    'brand.name as brandName',
                    'asset.model as model',
                    'asset.warrantyExpiry as warrantyExpiry'
                ]);

            const results = await query.getRawMany();

            const assets: StoreAssetModel[] = results.map(r => ({
                id: r.id,
                deviceName: r.deviceName,
                configuration: r.configuration,
                serialNumber: r.serialNumber,
                expressCode: r.expressCode,
                boxNo: r.boxNo,
                pastUserName: r.pastUserName,
                presentUserName: r.presentUserName,
                assetStatusEnum: r.assetStatusEnum,
                brandName: r.brandName,
                model: r.model,
                warrantyExpiry: r.warrantyExpiry
            }));

            return new GetStoreAssetsResponseModel(true, 200, 'Store assets retrieved successfully', assets);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch store assets');
        }
    }

    // ============================================
    // RETURN ASSETS TAB
    // ============================================
    async getReturnAssets(reqModel: GetReturnAssetsRequestModel): Promise<GetReturnAssetsResponseModel> {
        try {
            const query = this.dataSource
                .createQueryBuilder(AssetReturnHistoryEntity, 'returnHistory')
                .leftJoinAndSelect('employees', 'employee', 'returnHistory.employeeId = employee.id')
                .leftJoinAndSelect('asset_info', 'asset', 'returnHistory.assetId = asset.id')
                .leftJoinAndSelect('device_info', 'device', 'asset.deviceId = device.id')
                .where('returnHistory.companyId = :companyId', { companyId: reqModel.companyId });

            if (reqModel.startDate && reqModel.endDate) {
                query.andWhere('returnHistory.returnDate BETWEEN :startDate AND :endDate', {
                    startDate: reqModel.startDate,
                    endDate: reqModel.endDate
                });
            }

            if (reqModel.employeeId) {
                query.andWhere('returnHistory.employeeId = :employeeId', { employeeId: reqModel.employeeId });
            }

            query.select([
                'returnHistory.id as id',
                'CONCAT(employee.firstName, " ", employee.lastName) as employeeName',
                'employee.designation as employeeRole',
                'device.name as deviceType',
                'asset.configuration as configuration',
                'returnHistory.allocationDate as allocationDate',
                'returnHistory.returnDate as returnDate',
                'returnHistory.returnReason as returnReason',
                'returnHistory.assetCondition as assetCondition',
                'returnHistory.assetId as assetId',
                'asset.serialNumber as serialNumber'
            ]);

            const results = await query.getRawMany();

            const returns: ReturnAssetModel[] = results.map(r => ({
                id: r.id,
                employeeName: r.employeeName,
                employeeRole: r.employeeRole,
                laptopAllocationStatus: r.deviceType === 'Laptop' ? 'Returned' : undefined,
                desktopAllocationStatus: r.deviceType === 'Desktop' ? 'Returned' : undefined,
                configuration: r.configuration,
                allocationDate: r.allocationDate,
                returnDate: r.returnDate,
                returnReason: r.returnReason,
                assetCondition: r.assetCondition,
                assetId: r.assetId,
                serialNumber: r.serialNumber
            }));

            return new GetReturnAssetsResponseModel(true, 200, 'Return assets retrieved successfully', returns);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch return assets');
        }
    }

    async processReturn(reqModel: ProcessReturnRequestModel): Promise<ProcessReturnResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            // Create return history record
            const returnHistory = new AssetReturnHistoryEntity();
            returnHistory.assetId = reqModel.assetId;
            returnHistory.employeeId = reqModel.employeeId;
            returnHistory.returnDate = new Date(reqModel.returnDate);
            returnHistory.returnReason = reqModel.returnReason || '';
            returnHistory.assetCondition = reqModel.assetCondition || '';
            returnHistory.remarks = reqModel.remarks || '';
            returnHistory.userId = reqModel.userId;

            // Get asset allocation date
            const asset = await this.assetInfoRepo.findOne({ where: { id: reqModel.assetId } });
            if (asset) {
                returnHistory.allocationDate = asset.userAssignedDate;
            }

            const savedReturn = await transManager.getRepository(AssetReturnHistoryEntity).save(returnHistory);

            // Update asset status to available
            await transManager.getRepository(AssetInfoEntity).update(reqModel.assetId, {
                assetStatusEnum: AssetStatusEnum.AVAILABLE,
                previousUserEmployeeId: reqModel.employeeId,
                assignedToEmployeeId: undefined,
                lastReturnDate: new Date(reqModel.returnDate)
            });

            await transManager.completeTransaction();

            const returnRecord: ReturnAssetModel = {
                id: savedReturn.id,
                employeeName: '',
                returnDate: savedReturn.returnDate,
                returnReason: savedReturn.returnReason,
                assetCondition: savedReturn.assetCondition,
                assetId: savedReturn.assetId,
                allocationDate: savedReturn.allocationDate
            };

            return new ProcessReturnResponseModel(true, 201, 'Asset return processed successfully', returnRecord);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to process asset return');
        }
    }

    // ============================================
    // NEXT ASSIGN ASSETS TAB
    // ============================================
    async getNextAssignments(reqModel: GetNextAssignmentsRequestModel): Promise<GetNextAssignmentsResponseModel> {
        try {
            const query = this.dataSource
                .createQueryBuilder(AssetNextAssignmentEntity, 'assignment')
                .leftJoinAndSelect('employees', 'employee', 'assignment.employeeId = employee.id')
                .leftJoinAndSelect('asset_info', 'asset', 'assignment.assignedAssetId = asset.id')
                .leftJoinAndSelect('device_info', 'device', 'asset.deviceId = device.id')
                .where('assignment.companyId = :companyId', { companyId: reqModel.companyId })
                .andWhere('assignment.status != :cancelled', { cancelled: NextAssignmentStatusEnum.CANCELLED })
                .select([
                    'assignment.id as id',
                    'CONCAT(employee.firstName, " ", employee.lastName) as employeeName',
                    'employee.designation as employeeRole',
                    'assignment.assetType as assetType',
                    'assignment.requestDate as requestDate',
                    'assignment.expectedDate as expectedDate',
                    'assignment.assignedAssetId as assignedAssetId',
                    'device.name as assignedAssetName',
                    'assignment.status as status',
                    'assignment.priority as priority',
                    'assignment.remarks as remarks'
                ])
                .orderBy('assignment.priority', 'DESC')
                .addOrderBy('assignment.requestDate', 'ASC');

            const results = await query.getRawMany();

            const assignments: NextAssignmentModel[] = results.map(r => ({
                id: r.id,
                employeeName: r.employeeName,
                employeeRole: r.employeeRole,
                laptopAllocationStatus: r.assetType === 'Laptop' ? r.status : undefined,
                desktopAllocationStatus: r.assetType === 'Desktop' ? r.status : undefined,
                assetType: r.assetType,
                requestDate: r.requestDate,
                expectedDate: r.expectedDate,
                assignedAssetId: r.assignedAssetId,
                assignedAssetName: r.assignedAssetName,
                status: r.status,
                priority: r.priority,
                remarks: r.remarks
            }));

            return new GetNextAssignmentsResponseModel(true, 200, 'Next assignments retrieved successfully', assignments);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch next assignments');
        }
    }

    async createNextAssignment(reqModel: CreateNextAssignmentRequestModel): Promise<CreateNextAssignmentResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            const assignment = new AssetNextAssignmentEntity();
            assignment.employeeId = reqModel.employeeId;
            assignment.assetType = reqModel.assetType;
            assignment.requestDate = new Date(reqModel.requestDate);
            assignment.expectedDate = reqModel.expectedDate ? new Date(reqModel.expectedDate) : null as any;
            assignment.priority = (reqModel.priority as any) || AssignmentPriorityEnum.MEDIUM;
            assignment.remarks = reqModel.remarks || '';
            assignment.status = NextAssignmentStatusEnum.PENDING;
            assignment.userId = reqModel.userId;
            assignment.requestedById = reqModel.userId;

            const saved = await transManager.getRepository(AssetNextAssignmentEntity).save(assignment);

            await transManager.completeTransaction();

            const assignmentModel: NextAssignmentModel = {
                id: saved.id,
                employeeName: '',
                assetType: saved.assetType,
                requestDate: saved.requestDate,
                expectedDate: saved.expectedDate,
                status: saved.status as any as NextAssignmentStatus,
                priority: saved.priority as any as AssignmentPriority,
                remarks: saved.remarks
            };

            return new CreateNextAssignmentResponseModel(true, 201, 'Assignment request created successfully', assignmentModel);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create assignment request');
        }
    }

    async assignFromQueue(reqModel: AssignFromQueueRequestModel): Promise<AssignFromQueueResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();

            // Get the assignment record
            const assignment = await this.nextAssignmentRepo.findOne({ where: { id: reqModel.queueId } });
            if (!assignment) {
                throw new ErrorResponse(404, 'Assignment request not found');
            }

            // Update assignment with asset
            await transManager.getRepository(AssetNextAssignmentEntity).update(reqModel.queueId, {
                assignedAssetId: reqModel.assetId,
                status: NextAssignmentStatusEnum.ASSIGNED
            });

            // Update asset status
            await transManager.getRepository(AssetInfoEntity).update(reqModel.assetId, {
                assignedToEmployeeId: assignment.employeeId,
                assetStatusEnum: AssetStatusEnum.IN_USE,
                userAssignedDate: new Date()
            });

            await transManager.completeTransaction();

            const assignmentModel: NextAssignmentModel = {
                id: assignment.id,
                employeeName: '',
                assetType: assignment.assetType,
                requestDate: assignment.requestDate,
                assignedAssetId: reqModel.assetId,
                status: NextAssignmentStatusEnum.ASSIGNED as any as NextAssignmentStatus,
                priority: assignment.priority as any as AssignmentPriority
            };

            return new AssignFromQueueResponseModel(true, 200, 'Asset assigned successfully', assignmentModel);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to assign asset from queue');
        }
    }
}
