import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { AssetInfoEntity } from "../entities/asset-info.entity";

@Injectable()
export class AssetInfoRepository extends Repository<AssetInfoEntity> {
    constructor(private dataSource: DataSource) {
        super(AssetInfoEntity, dataSource.createEntityManager());
    }

    /**
     * Get assets with their assignment information using TypeORM Query Builder
     * This method joins with device_info, asset_assign, and employees tables
     */
    async getAssetsWithAssignments(companyId: number) {
        return await this.createQueryBuilder('asset')
            .leftJoin('device_info', 'device', 'asset.device_id = device.id')
            .leftJoin('asset_assign', 'assignment', 'asset.id = assignment.asset_id AND assignment.return_date IS NULL')
            .leftJoin('employees', 'employee', 'assignment.employee_id = employee.id')
            .select([
                'asset.id as id',
                'asset.company_id as companyId',
                'asset.device_id as deviceId',
                'asset.brand_id as brandId',
                'asset.model as model',
                'asset.configuration as configuration',
                'asset.serial_number as serialNumber',
                'asset.purchase_date as purchaseDate',
                'asset.warranty_expiry as warrantyExpiry',
                'asset.user_assigned_date as userAssignedDate',
                'asset.last_return_date as lastReturnDate',
                'asset.assigned_to_employee_id as assignedToEmployeeId',
                'asset.previous_user_employee_id as previousUserEmployeeId',
                'asset.asset_status_enum as assetStatusEnum',
                'asset.created_at as createdAt',
                'asset.updated_at as updatedAt',
                'device.device_name as deviceName',
                'device.device_type as deviceType',
            ])
            .addSelect('CONCAT(employee.first_name, \' \', employee.last_name)', 'assignedTo')
            .addSelect('assignment.assigned_date', 'assignedDate')
            .addSelect('assignment.assigned_by_id', 'assignedById')
            .where('asset.company_id = :companyId', { companyId })
            .orderBy('asset.created_at', 'DESC')
            .getRawMany();
    }

    /**
     * Get asset statistics by status for a company
     */
    async getAssetStatistics(companyId: number) {
        return await this.createQueryBuilder('asset')
            .select('asset.asset_status_enum', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('asset.company_id = :companyId', { companyId })
            .groupBy('asset.asset_status_enum')
            .getRawMany();
    }

    /**
     * Search assets by serial number or device name
     */
    async searchAssets(reqModel: import('@adminvault/shared-models').AssetSearchRequestModel) {
        const query = this.createQueryBuilder('asset')
            .leftJoin('device_info', 'device', 'asset.device_id = device.id')
            .leftJoin('employees', 'employee', 'asset.assigned_to_employee_id = employee.id')
            .select([
                'asset.id as id',
                'asset.company_id as companyId',
                'asset.device_id as deviceId',
                'asset.brand_id as brandId',
                'asset.model as model',
                'asset.configuration as configuration',
                'asset.serial_number as serialNumber',
                'asset.purchase_date as purchaseDate',
                'asset.warranty_expiry as warrantyExpiry',
                'asset.user_assigned_date as userAssignedDate',
                'asset.last_return_date as lastReturnDate',
                'asset.assigned_to_employee_id as assignedToEmployeeId',
                'asset.previous_user_employee_id as previousUserEmployeeId',
                'asset.asset_status_enum as assetStatusEnum',
                'asset.created_at as createdAt',
                'device.device_name as deviceName',
                'device.device_type as deviceType',
            ])
            .addSelect('CONCAT(employee.first_name, \' \', employee.last_name)', 'assignedTo')
            .where('asset.company_id = :companyId', { companyId: reqModel.companyId });

        if (reqModel.searchQuery) {
            query.andWhere(
                '(asset.serial_number LIKE :search OR device.device_name LIKE :search)',
                { search: `%${reqModel.searchQuery}%` }
            );
        }

        if (reqModel.statusFilter && reqModel.statusFilter.length > 0) {
            // Handle both single status and array of statuses
            const statuses = Array.isArray(reqModel.statusFilter) ? reqModel.statusFilter : [reqModel.statusFilter];
            query.andWhere('asset.asset_status_enum IN (:...statuses)', { statuses });
        }

        if (reqModel.brandIds && reqModel.brandIds.length > 0) {
            query.andWhere('asset.brand_id IN (:...brandIds)', { brandIds: reqModel.brandIds });
        }

        if (reqModel.assetTypeIds && reqModel.assetTypeIds.length > 0) {
            query.andWhere('asset.device_id IN (:...assetTypeIds)', { assetTypeIds: reqModel.assetTypeIds });
        }

        if (reqModel.employeeId) {
            query.andWhere('asset.assigned_to_employee_id = :employeeId', { employeeId: reqModel.employeeId });
        }

        if (reqModel.purchaseDateFrom) {
            query.andWhere('asset.purchase_date >= :purchaseDateFrom', { purchaseDateFrom: reqModel.purchaseDateFrom });
        }

        if (reqModel.purchaseDateTo) {
            query.andWhere('asset.purchase_date <= :purchaseDateTo', { purchaseDateTo: reqModel.purchaseDateTo });
        }

        return await query
            .orderBy('asset.created_at', 'DESC')
            .getRawMany();
    }
}
