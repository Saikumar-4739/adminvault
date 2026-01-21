import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SettingsEntity } from '../entities/settings.entity';

@Injectable()
export class SettingsRepository extends Repository<SettingsEntity> {
    constructor(private dataSource: DataSource) {
        super(SettingsEntity, dataSource.createEntityManager());
    }
}
