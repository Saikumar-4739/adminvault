import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetInfoEntity } from '../../entities/asset-info.entity';
import { AssetReturnHistoryEntity } from '../../entities/asset-return-history.entity';
import { EmployeesEntity } from '../../entities/employees.entity';
import {
    AssetTimelineEvent,
    AssetTimelineEventType,
    AssetTimelineResponseModel
} from '@adminvault/shared-models';
import { returnException } from '@adminvault/backend-utils';

@Injectable()
export class AssetHistoryService {
    constructor(
        @InjectRepository(AssetInfoEntity)
        private assetRepo: Repository<AssetInfoEntity>,

        @InjectRepository(AssetReturnHistoryEntity)
        private returnHistoryRepo: Repository<AssetReturnHistoryEntity>,

        @InjectRepository(EmployeesEntity)
        private employeeRepo: Repository<EmployeesEntity>
    ) { }

    async getAssetTimeline(assetId: number, companyId: number): Promise<AssetTimelineResponseModel> {
        try {
            const asset = await this.assetRepo.findOne({
                where: { id: assetId, companyId: companyId }
            });

            if (!asset) {
                return new AssetTimelineResponseModel(false, 404, 'Asset not found', []);
            }

            const events: AssetTimelineEvent[] = [];

            // 1. Creation Event
            if (asset.createdAt) {
                events.push({
                    id: `created-${asset.id}`,
                    date: asset.createdAt,
                    type: AssetTimelineEventType.CREATED,
                    title: 'Asset Onboarded',
                    description: `Asset ${asset.model || asset.serialNumber} added to inventory.`,
                    performedBy: 'System' // Or created_by if available
                });
            }

            // 2. Return History (Past Assignments & Returns)
            // Note: return history captures when it was returned AND when it was allocated
            const returnRecords = await this.returnHistoryRepo.find({
                where: { assetId: assetId, companyId: companyId },
                order: { returnDate: 'DESC' }
            });

            for (const record of returnRecords) {
                const employee = await this.employeeRepo.findOne({ where: { id: record.employeeId } });
                const empName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';

                // Return Event
                events.push({
                    id: `return-${record.id}`,
                    date: record.returnDate,
                    type: AssetTimelineEventType.RETURNED,
                    title: `Returned by ${empName}`,
                    description: record.returnReason || 'No reason provided',
                    employeeName: empName,
                    employeeId: Number(record.employeeId), // TypeORM might return string for bigint
                    metadata: {
                        condition: record.assetCondition,
                        remarks: record.remarks
                    }
                });

                // Original Allocation Event
                // Even if allocationDate is missing, we record that it WAS assigned to this user
                const allocDate = record.allocationDate || new Date(new Date(record.returnDate).getTime() - 1000); // Fallback to slightly before return if missing
                const isDateEstimated = !record.allocationDate;

                events.push({
                    id: `alloc-historic-${record.id}`,
                    date: allocDate,
                    type: AssetTimelineEventType.ASSIGNED,
                    title: `Assigned to ${empName}`,
                    description: isDateEstimated ? 'Historical assignment' : 'Historical assignment',
                    employeeName: empName,
                    employeeId: Number(record.employeeId)
                });
            }

            // 3. Current Assignment
            if (asset.assignedToEmployeeId) {
                const currentEmp = await this.employeeRepo.findOne({ where: { id: asset.assignedToEmployeeId } });
                const currentEmpName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : 'Current User';

                // If we possess a userAssignedDate, use it. Otherwise fall back to updated_at or similar if logical, 
                // but userAssignedDate is best.
                const assignDate = asset.userAssignedDate || new Date(); // Fallback to now if missing is risky but better than nothing for "Current"

                events.push({
                    id: `current-assign-${asset.id}`,
                    date: assignDate,
                    type: AssetTimelineEventType.ASSIGNED,
                    title: `Currently Assigned to ${currentEmpName}`,
                    description: 'Active assignment',
                    employeeName: currentEmpName,
                    employeeId: Number(asset.assignedToEmployeeId)
                });
            }

            // Sort by Date Descending
            events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return new AssetTimelineResponseModel(true, 200, 'Timeline fetched successfully', events);

        } catch (error) {
            return returnException(AssetTimelineResponseModel, error);
        }
    }
}
