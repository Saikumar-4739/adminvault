import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MaintenanceScheduleEntity } from '../asset-info/entities/maintenance-schedule.entity';
import { AssetInfoEntity } from '../asset-info/entities/asset-info.entity';
import {
    MaintenanceStatusEnum,
    MaintenanceTypeEnum,
    CreateMaintenanceModel,
    MaintenanceResponseModel,
    GlobalResponse
} from '@adminvault/shared-models';
import { ErrorResponse } from '@adminvault/backend-utils';

@Injectable()
export class MaintenanceService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(MaintenanceScheduleEntity)
        private maintenanceRepo: Repository<MaintenanceScheduleEntity>,
        @InjectRepository(AssetInfoEntity)
        private assetRepo: Repository<AssetInfoEntity>
    ) { }

    async createSchedule(model: CreateMaintenanceModel): Promise<GlobalResponse> {
        try {
            const asset = await this.assetRepo.findOne({ where: { id: model.assetId } });
            if (!asset) throw new ErrorResponse(404, "Asset not found");

            const entity = this.maintenanceRepo.create({
                ...model,
                status: MaintenanceStatusEnum.SCHEDULED
            });

            await this.maintenanceRepo.save(entity);
            return new GlobalResponse(true, 201, "Maintenance scheduled successfully");
        } catch (error) {
            throw error;
        }
    }

    async getSchedules(assetId?: number, companyId?: number): Promise<MaintenanceResponseModel[]> {
        const query = this.maintenanceRepo.createQueryBuilder('m')
            .leftJoinAndSelect('m.asset', 'asset')
            .orderBy('m.scheduledDate', 'ASC');

        if (assetId) {
            query.where('m.assetId = :assetId', { assetId });
        } else if (companyId) {
            // Filter by asset's companyId
            query.where('asset.companyId = :companyId', { companyId });
        }

        const schedules = await query.getMany();

        return schedules.map(s => new MaintenanceResponseModel(
            s.id, s.assetId, s.asset?.serialNumber, s.maintenanceType, s.scheduledDate, s.status, s.description, s.completedAt, s.timeSpentMinutes
        ));
    }

    async updateStatus(id: number, status: MaintenanceStatusEnum): Promise<GlobalResponse> {
        const schedule = await this.maintenanceRepo.findOne({ where: { id } });
        if (!schedule) throw new ErrorResponse(404, "Schedule not found");

        schedule.status = status;
        if (status === MaintenanceStatusEnum.COMPLETED) {
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
    }
}
