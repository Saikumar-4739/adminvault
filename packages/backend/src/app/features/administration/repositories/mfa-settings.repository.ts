import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { MFASettingsEntity } from "../entities/mfa-settings.entity";

@Injectable()
export class MFASettingsRepository extends Repository<MFASettingsEntity> {
    constructor(private dataSource: DataSource) {
        super(MFASettingsEntity, dataSource.createEntityManager());
    }
}
