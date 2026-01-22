import { Injectable } from '@nestjs/common';
import { MaintenanceRepository } from './repositories/maintenance.repository';
import { AssetInfoRepository } from '../asset-info/repositories/asset-info.repository';
import { MaintenanceStatusEnum, CreateMaintenanceRequestModel, MaintenanceArticleModel, GetMaintenanceSchedulesRequestModel, GetMaintenanceSchedulesResponseModel, UpdateMaintenanceStatusRequestModel, GlobalResponse } from '@adminvault/shared-models';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class MaintenanceService {
    constructor(
        private maintenanceRepo: MaintenanceRepository,
        private assetRepo: AssetInfoRepository
    ) { }

    async createSchedule(reqModel: CreateMaintenanceRequestModel): Promise<GlobalResponse> {
        try {
            const asset = await this.assetRepo.findOne({ where: { id: reqModel.assetId } });
            if (!asset) throw new ErrorResponse(404, "Asset not found");

            const entity = this.maintenanceRepo.create({
                ...reqModel,
                status: MaintenanceStatusEnum.SCHEDULED
            });

            await this.maintenanceRepo.save(entity);
            return new GlobalResponse(true, 201, "Maintenance scheduled successfully");
        } catch (error) {
            throw error;
        }
    }

    async getSchedules(reqModel: GetMaintenanceSchedulesRequestModel): Promise<GetMaintenanceSchedulesResponseModel> {
        try {
            const query = this.maintenanceRepo.createQueryBuilder('m')
                .leftJoinAndSelect('m.asset', 'asset')
                .orderBy('m.scheduledDate', 'ASC');

            if (reqModel.assetId) {
                query.where('m.assetId = :assetId', { assetId: reqModel.assetId });
            } else if (reqModel.companyId) {
                query.where('asset.companyId = :companyId', { companyId: reqModel.companyId });
            }

            const schedules = await query.getMany();

            const maintenanceModels = schedules.map(s => new MaintenanceArticleModel({
                id: s.id,
                assetId: s.assetId,
                assetSerial: s.asset?.serialNumber,
                maintenanceType: s.maintenanceType,
                scheduledDate: s.scheduledDate,
                status: s.status,
                description: s.description,
                completedAt: s.completedAt,
                timeSpentMinutes: s.timeSpentMinutes,
                isRecurring: s.isRecurring,
                frequencyDays: s.frequencyDays
            }));

            return new GetMaintenanceSchedulesResponseModel(true, 200, "Schedules retrieved successfully", maintenanceModels);
        } catch (error) {
            throw error;
        }
    }

    async updateStatus(reqModel: UpdateMaintenanceStatusRequestModel): Promise<GlobalResponse> {
        try {
            const schedule = await this.maintenanceRepo.findOne({ where: { id: reqModel.id } });
            if (!schedule) throw new ErrorResponse(404, "Schedule not found");

            schedule.status = reqModel.status;
            if (reqModel.status === MaintenanceStatusEnum.COMPLETED) {
                schedule.completedAt = new Date();

                // If recurring, create next schedule
                if (schedule.isRecurring && schedule.frequencyDays) {
                    const nextDate = new Date(schedule.scheduledDate);
                    nextDate.setDate(nextDate.getDate() + schedule.frequencyDays);

                    const nextSchedule = this.maintenanceRepo.create({
                        assetId: schedule.assetId,
                        maintenanceType: schedule.maintenanceType,
                        scheduledDate: nextDate,
                        description: schedule.description,
                        isRecurring: true,
                        frequencyDays: schedule.frequencyDays,
                        status: MaintenanceStatusEnum.SCHEDULED
                    });
                    await this.maintenanceRepo.save(nextSchedule);
                }
            }

            await this.maintenanceRepo.save(schedule);
            return new GlobalResponse(true, 200, "Maintenance status updated");
        } catch (error) {
            throw error;
        }
    }
}
