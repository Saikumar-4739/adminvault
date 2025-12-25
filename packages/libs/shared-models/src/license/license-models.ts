import { GlobalResponse } from '@adminvault/backend-utils';

/**
 * Request model for creating a new license assignment
 */
export class CreateLicenseModel {
    companyId: number;
    applicationId: number;
    assignedEmployeeId?: number;
    licenseKey?: string;
    purchaseDate?: Date;
    expiryDate?: Date;
    seats?: number;
    notes?: string;

    constructor(
        companyId: number,
        applicationId: number,
        assignedEmployeeId?: number,
        licenseKey?: string,
        purchaseDate?: Date,
        expiryDate?: Date,
        seats?: number,
        notes?: string
    ) {
        this.companyId = companyId;
        this.applicationId = applicationId;
        this.assignedEmployeeId = assignedEmployeeId;
        this.licenseKey = licenseKey;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.seats = seats;
        this.notes = notes;
    }
}

/**
 * Request model for updating an existing license assignment
 */
export class UpdateLicenseModel {
    id: number;
    companyId?: number;
    applicationId?: number;
    assignedEmployeeId?: number;
    licenseKey?: string;
    purchaseDate?: Date;
    expiryDate?: Date;
    seats?: number;
    notes?: string;

    constructor(
        id: number,
        companyId?: number,
        applicationId?: number,
        assignedEmployeeId?: number,
        licenseKey?: string,
        purchaseDate?: Date,
        expiryDate?: Date,
        seats?: number,
        notes?: string
    ) {
        this.id = id;
        this.companyId = companyId;
        this.applicationId = applicationId;
        this.assignedEmployeeId = assignedEmployeeId;
        this.licenseKey = licenseKey;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.seats = seats;
        this.notes = notes;
    }
}

/**
 * Request model for deleting a license assignment
 */
export class DeleteLicenseModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

/**
 * Request model for getting a specific license
 */
export class GetLicenseModel {
    id: number;

    constructor(id: number) {
        this.id = id;
    }
}

/**
 * Response model for a single license
 */
export class LicenseResponseModel {
    id: number;
    companyId: number;
    applicationId: number;
    assignedEmployeeId?: number;
    licenseKey?: string;
    purchaseDate?: Date;
    expiryDate?: Date;
    seats?: number;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        companyId: number,
        applicationId: number,
        createdAt: Date,
        updatedAt: Date,
        assignedEmployeeId?: number,
        licenseKey?: string,
        purchaseDate?: Date,
        expiryDate?: Date,
        seats?: number,
        notes?: string
    ) {
        this.id = id;
        this.companyId = companyId;
        this.applicationId = applicationId;
        this.assignedEmployeeId = assignedEmployeeId;
        this.licenseKey = licenseKey;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.seats = seats;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

/**
 * Response model for getting all licenses
 */
export class GetAllLicensesModel extends GlobalResponse {
    data: LicenseResponseModel[];

    constructor(status: boolean, code: number, message: string, data: LicenseResponseModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

/**
 * Response model for getting a single license by ID
 */
export class GetLicenseByIdModel extends GlobalResponse {
    data: LicenseResponseModel;

    constructor(status: boolean, code: number, message: string, data: LicenseResponseModel) {
        super(status, code, message);
        this.data = data;
    }
}

/**
 * Response model for license statistics
 */
export class LicenseStatsModel {
    totalLicenses: number;
    usedLicenses: number;
    totalCost: number;
    expiringSoon: number;

    constructor(totalLicenses: number, usedLicenses: number, totalCost: number, expiringSoon: number) {
        this.totalLicenses = totalLicenses;
        this.usedLicenses = usedLicenses;
        this.totalCost = totalCost;
        this.expiringSoon = expiringSoon;
    }
}

/**
 * Response model for license statistics endpoint
 */
export class GetLicenseStatsModel extends GlobalResponse {
    data: LicenseStatsModel;

    constructor(status: boolean, code: number, message: string, data: LicenseStatsModel) {
        super(status, code, message);
        this.data = data;
    }
}
