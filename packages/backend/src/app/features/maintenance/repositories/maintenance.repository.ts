import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MaintenanceScheduleEntity } from '../entities/maintenance-schedule.entity';

@Injectable()
export class MaintenanceRepository extends Repository<MaintenanceScheduleEntity> {
    constructor(private dataSource: DataSource) {
        super(MaintenanceScheduleEntity, dataSource.createEntityManager());
    }
}
