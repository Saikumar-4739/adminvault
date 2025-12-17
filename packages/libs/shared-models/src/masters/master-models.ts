import { GlobalResponse } from '@adminvault/backend-utils';

// ============================================
// BASE INTERFACES
// ============================================
export interface MasterBase {
    id: number;
    userId: number;
    companyId: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Department extends MasterBase {
    code?: string;
}

export interface Designation extends MasterBase {
    level?: string;
}

export interface AssetType extends MasterBase { }

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
    defaultPriority?: 'Low' | 'Medium' | 'High' | null;
}

// ============================================
// REQUEST MODELS - CREATE
// ============================================
export class CreateMasterModel {
    id?: number;
    userId: number;
    companyId: number;
    name: string;
    description?: string;
    isActive?: boolean = true;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, id?: number) {
        this.userId = userId;
        this.companyId = companyId;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.id = id;
    }
}

export class CreateDepartmentModel extends CreateMasterModel {
    code?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, code?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.code = code;
    }
}

export class CreateDesignationModel extends CreateMasterModel {
    level?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, level?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.level = level;
    }
}

export class CreateAssetTypeModel extends CreateMasterModel {
    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, id?: number) {
        super(userId, companyId, name, description, isActive, id);
    }
}

export class CreateBrandModel extends CreateMasterModel {
    website?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, website?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.website = website;
    }
}

export class CreateVendorModel extends CreateMasterModel {
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, contactPerson?: string, email?: string, phone?: string, address?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}

export class CreateLocationModel extends CreateMasterModel {
    address?: string;
    city?: string;
    country?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, address?: string, city?: string, country?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.address = address;
        this.city = city;
        this.country = country;
    }
}

export class CreateTicketCategoryModel extends CreateMasterModel {
    defaultPriority?: 'Low' | 'Medium' | 'High';

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, defaultPriority?: 'Low' | 'Medium' | 'High', id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.defaultPriority = defaultPriority;
    }
}

// ============================================
// RESPONSE MODELS - GET ALL
// ============================================
export class GetAllDepartmentsResponseModel extends GlobalResponse {
    departments: Department[];

    constructor(status: boolean, code: number, message: string, departments: Department[]) {
        super(status, code, message);
        this.departments = departments;
    }
}

export class GetAllDesignationsResponseModel extends GlobalResponse {
    designations: Designation[];

    constructor(status: boolean, code: number, message: string, designations: Designation[]) {
        super(status, code, message);
        this.designations = designations;
    }
}

export class GetAllAssetTypesResponseModel extends GlobalResponse {
    assetTypes: AssetType[];

    constructor(status: boolean, code: number, message: string, assetTypes: AssetType[]) {
        super(status, code, message);
        this.assetTypes = assetTypes;
    }
}

export class GetAllBrandsResponseModel extends GlobalResponse {
    brands: DeviceBrand[];

    constructor(status: boolean, code: number, message: string, brands: DeviceBrand[]) {
        super(status, code, message);
        this.brands = brands;
    }
}

export class GetAllVendorsResponseModel extends GlobalResponse {
    vendors: Vendor[];

    constructor(status: boolean, code: number, message: string, vendors: Vendor[]) {
        super(status, code, message);
        this.vendors = vendors;
    }
}

export class GetAllLocationsResponseModel extends GlobalResponse {
    locations: Location[];

    constructor(status: boolean, code: number, message: string, locations: Location[]) {
        super(status, code, message);
        this.locations = locations;
    }
}

export class GetAllTicketCategoriesResponseModel extends GlobalResponse {
    ticketCategories: TicketCategory[];

    constructor(status: boolean, code: number, message: string, ticketCategories: TicketCategory[]) {
        super(status, code, message);
        this.ticketCategories = ticketCategories;
    }
}

// ============================================
// RESPONSE MODELS - CREATE (Single Item)
// ============================================
export class CreateDepartmentResponseModel extends GlobalResponse {
    department: Department;

    constructor(status: boolean, code: number, message: string, department: Department) {
        super(status, code, message);
        this.department = department;
    }
}

export class CreateDesignationResponseModel extends GlobalResponse {
    designation: Designation;

    constructor(status: boolean, code: number, message: string, designation: Designation) {
        super(status, code, message);
        this.designation = designation;
    }
}

export class CreateAssetTypeResponseModel extends GlobalResponse {
    assetType: AssetType;

    constructor(status: boolean, code: number, message: string, assetType: AssetType) {
        super(status, code, message);
        this.assetType = assetType;
    }
}

export class CreateBrandResponseModel extends GlobalResponse {
    brand: DeviceBrand;

    constructor(status: boolean, code: number, message: string, brand: DeviceBrand) {
        super(status, code, message);
        this.brand = brand;
    }
}

export class CreateVendorResponseModel extends GlobalResponse {
    vendor: Vendor;

    constructor(status: boolean, code: number, message: string, vendor: Vendor) {
        super(status, code, message);
        this.vendor = vendor;
    }
}

export class CreateLocationResponseModel extends GlobalResponse {
    location: Location;

    constructor(status: boolean, code: number, message: string, location: Location) {
        super(status, code, message);
        this.location = location;
    }
}

export class CreateTicketCategoryResponseModel extends GlobalResponse {
    ticketCategory: TicketCategory;

    constructor(status: boolean, code: number, message: string, ticketCategory: TicketCategory) {
        super(status, code, message);
        this.ticketCategory = ticketCategory;
    }
}
