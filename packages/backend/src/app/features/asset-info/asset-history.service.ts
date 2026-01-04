import { Injectable } from '@nestjs/common';
import { AssetTimelineEvent, AssetTimelineEventType, AssetTimelineResponseModel } from '@adminvault/shared-models';
import { returnException } from '@adminvault/backend-utils';
import { AssetInfoRepository } from './repositories/asset-info.repository';
import { AssetReturnHistoryRepository } from './repositories/asset-return-history.repository';
import { EmployeesRepository } from '../employees/repositories/employees.repository';
import { In } from 'typeorm';

@Injectable()
export class AssetHistoryService {
    constructor(
        private readonly assetRepo: AssetInfoRepository,
        private readonly returnHistoryRepo: AssetReturnHistoryRepository,
        private readonly employeeRepo: EmployeesRepository
    ) { }

    async getAssetTimeline(assetId: number, companyId: number): Promise<AssetTimelineResponseModel> {
        try {
            const asset = await this.assetRepo.findOne({ where: { id: assetId, companyId } });
            if (!asset) {
                return new AssetTimelineResponseModel(false, 404, 'Asset not found', []);
            }

            const events: AssetTimelineEvent[] = [];
            if (asset.createdAt) {
                events.push({ id: `created-${asset.id}`, date: asset.createdAt, type: AssetTimelineEventType.CREATED, title: 'Asset Onboarded', description: `Asset ${asset.model || asset.serialNumber} added to inventory.`, performedBy: 'System' });
            }

            const returnRecords = await this.returnHistoryRepo.find({ where: { assetId, companyId }, order: { returnDate: 'DESC' } });
            const employeeIds = [...new Set(returnRecords.map(r => Number(r.employeeId)))];
            const employees = employeeIds.length > 0 ? await this.employeeRepo.find({ where: { id: In(employeeIds) } }) : [];
            const employeeMap = new Map(employees.map(e => [Number(e.id), `${e.firstName} ${e.lastName}`]));
            for (const record of returnRecords) {
                const empName = employeeMap.get(Number(record.employeeId)) || 'Unknown Employee';
                if (record.allocationDate) {
                    events.push({ id: `assigned-${record.id}`, date: record.allocationDate, type: AssetTimelineEventType.ASSIGNED, title: `Assigned to ${empName}`, description: 'Asset assigned', employeeName: empName, employeeId: Number(record.employeeId) });
                }
                events.push({ id: `returned-${record.id}`, date: record.returnDate, type: AssetTimelineEventType.RETURNED, title: `Returned by ${empName}`, description: record.returnReason || 'No reason provided', employeeName: empName, employeeId: Number(record.employeeId), metadata: { condition: record.assetCondition, remarks: record.remarks } });
            }

            if (asset.assignedToEmployeeId && asset.userAssignedDate) {
                const currentEmp = await this.employeeRepo.findOne({ where: { id: asset.assignedToEmployeeId } });
                const currentEmpName = currentEmp ? `${currentEmp.firstName} ${currentEmp.lastName}` : 'Current User';
                events.push({ id: `current-assign-${asset.id}`, date: asset.userAssignedDate, type: AssetTimelineEventType.ASSIGNED, title: `Currently Assigned to ${currentEmpName}`, description: 'Active assignment', employeeName: currentEmpName, employeeId: Number(asset.assignedToEmployeeId) });
            }
            events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return new AssetTimelineResponseModel(true, 200, 'Timeline fetched successfully', events);
        } catch (error) {
           throw error;
        }
    }
}
