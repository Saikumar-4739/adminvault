
export interface MasterBase {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Interfaces
export interface Department extends MasterBase {
    code?: string;
}

export interface Designation extends MasterBase {
    level?: string;
}

export interface AssetType extends MasterBase {
    // e.g. Hardware, Software
}

export interface DeviceBrand extends MasterBase {
    website?: string;
}

export interface Vendor extends MasterBase {
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface Location extends MasterBase {
    address?: string;
    city?: string;
    country?: string;
}

export interface TicketCategory extends MasterBase {
    defaultPriority?: 'Low' | 'Medium' | 'High';
}

// API Models
export class GenerateMasterResponse<T> {
    success: boolean;
    data?: T[];
    message: string;

    constructor(success: boolean, message: string, data?: T[]) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
}

export class CreateMasterModel {
    name: string;
    description?: string;
    isActive?: boolean = true;

    // Specific fields will be handled by spreading ...extraData in service or specific classes if needed.
    // For simplicity in this unified approach, we can define specific Create models or a Union.
    // Let's go with specific Create models for clarity in Swagger later.
}

export class CreateDepartmentModel extends CreateMasterModel {
    code?: string;
}

export class CreateDesignationModel extends CreateMasterModel {
    level?: string;
}

export class CreateVendorModel extends CreateMasterModel {
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export class CreateLocationModel extends CreateMasterModel {
    address?: string;
    city?: string;
    country?: string;
}

export class CreateTicketCategoryModel extends CreateMasterModel {
    defaultPriority?: string;
}

// For generic usage in frontend if strictly needed, but specific is better.
