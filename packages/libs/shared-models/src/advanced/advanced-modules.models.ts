import {
    SoftwareTypeEnum
} from '../enums';

// --- Work Log Models (for Tickets) ---

export class CreateWorkLogModel {
    ticketId: number;
    technicianId: number;
    startTime: Date;
    endTime?: Date;
    timeSpentMinutes?: number;
    description: string;

    constructor(ticketId: number, technicianId: number, startTime: Date, description: string, endTime?: Date, timeSpentMinutes?: number) {
        this.ticketId = ticketId;
        this.technicianId = technicianId;
        this.startTime = startTime;
        this.description = description;
        this.endTime = endTime;
        this.timeSpentMinutes = timeSpentMinutes;
    }
}

export class WorkLogResponseModel {
    id: number;
    ticketId: number;
    technicianName: string;
    startTime: Date;
    endTime?: Date;
    timeSpentMinutes: number;
    description: string;

    constructor(id: number, ticketId: number, technicianName: string, startTime: Date, timeSpentMinutes: number, description: string, endTime?: Date) {
        this.id = id;
        this.ticketId = ticketId;
        this.technicianName = technicianName;
        this.startTime = startTime;
        this.timeSpentMinutes = timeSpentMinutes;
        this.description = description;
        this.endTime = endTime;
    }
}

// --- Software Inventory Models ---

export class SoftwareModel {
    id: number;
    name: string;
    version: string;
    publisher: string;
    type: SoftwareTypeEnum;
    licenseKey?: string;

    constructor(id: number, name: string, version: string, publisher: string, type: SoftwareTypeEnum, licenseKey?: string) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.publisher = publisher;
        this.type = type;
        this.licenseKey = licenseKey;
    }
}

export class AssetSoftwareModel {
    assetId: number;
    softwareId: number;
    softwareName?: string;
    installedAt: Date;
    lastPatchedAt?: Date;
    status: string;

    constructor(assetId: number, softwareId: number, installedAt: Date, status: string, softwareName?: string, lastPatchedAt?: Date) {
        this.assetId = assetId;
        this.softwareId = softwareId;
        this.installedAt = installedAt;
        this.status = status;
        this.softwareName = softwareName;
        this.lastPatchedAt = lastPatchedAt;
    }
}

// --- Software Inventory Models ---

export class GetAssetSoftwareRequestModel {
    assetId: number;

    constructor(assetId: number) {
        this.assetId = assetId;
    }
}

export class InstallSoftwareRequestModel {
    assetId: number;
    softwareId: number;

    constructor(assetId: number, softwareId: number) {
        this.assetId = assetId;
        this.softwareId = softwareId;
    }
}
