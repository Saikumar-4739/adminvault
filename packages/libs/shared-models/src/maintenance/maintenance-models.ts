import { MaintenanceStatusEnum, MaintenanceTypeEnum } from '../enums/advanced-modules.enum';
import { GlobalResponse } from '../common/global-response';

export class MaintenanceArticleModel {
    id!: number;
    assetId!: number;
    assetSerial!: string;
    maintenanceType!: MaintenanceTypeEnum;
    scheduledDate!: Date;
    status!: MaintenanceStatusEnum;
    description!: string;
    completedAt?: Date;
    timeSpentMinutes?: number;
    isRecurring!: boolean;
    frequencyDays?: number;

    constructor(partial?: Partial<MaintenanceArticleModel>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}

export class CreateMaintenanceRequestModel {
    assetId!: number;
    maintenanceType!: MaintenanceTypeEnum;
    scheduledDate!: Date;
    description!: string;
    isRecurring: boolean = false;
    frequencyDays?: number;
    timeSpentMinutes?: number;
}

export class UpdateMaintenanceStatusRequestModel {
    id!: number;
    status!: MaintenanceStatusEnum;
}

export class GetMaintenanceSchedulesRequestModel {
    assetId?: number;
    companyId?: number;
}

export class GetMaintenanceSchedulesResponseModel extends GlobalResponse<MaintenanceArticleModel[]> {
    schedules!: MaintenanceArticleModel[];
    constructor(status: boolean, code: number, message: string, data: MaintenanceArticleModel[]) {
        super(status, code, message, data);
        this.schedules = data;
    }
}
