import { GlobalResponse } from '../common/global-response';

// ============================================
// BASE INTERFACES
// ============================================
export class MasterBase {
    id: number;
    userId: number;
    companyId?: number;  // Optional - masters are shared across companies
    name: string;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        this.id = id;
        this.userId = userId;
        this.name = name;
        this.isActive = isActive;
        this.companyId = companyId;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

export class Department extends MasterBase {
    companyName?: string;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        companyName?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.companyName = companyName;
    }
}

export class Designation extends MasterBase {
    level?: string;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        level?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.level = level;
    }
}

export class AssetType extends MasterBase {
    code?: string;
    companyName?: string;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        code?: string,
        companyName?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.code = code;
        this.companyName = companyName;
    }
}

export class DeviceBrand extends MasterBase {
    website?: string;
    rating?: any;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        website?: string,
        rating?: any,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.website = website;
        this.rating = rating;
    }
}

export class Vendor extends MasterBase {
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        contactPerson?: string,
        email?: string,
        phone?: string,
        address?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}

export class Location extends MasterBase {
    address?: string;
    city?: string;
    country?: string;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        address?: string,
        city?: string,
        country?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.address = address;
        this.city = city;
        this.country = country;
    }
}

export class TicketCategory extends MasterBase {
    defaultPriority?: 'Low' | 'Medium' | 'High' | null;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        defaultPriority?: 'Low' | 'Medium' | 'High' | null,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.defaultPriority = defaultPriority;
    }
}

export class License extends MasterBase {
    purchaseDate?: Date;
    expiryDate?: Date;
    companyName?: string;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        purchaseDate?: Date,
        expiryDate?: Date,
        companyName?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
        this.companyName = companyName;
    }
}

export class ExpenseCategory extends MasterBase {
    categoryType?: string;
    budgetLimit?: number;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        companyId?: number,
        description?: string,
        categoryType?: string,
        budgetLimit?: number,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.categoryType = categoryType;
        this.budgetLimit = budgetLimit;
    }
}


export class SlackUserModel extends MasterBase {
    email: string;
    slackUserId?: string;
    displayName?: string;
    role?: string;
    department?: string;
    phone?: string;
    notes?: string;
    avatar?: string;
    employeeId?: number;
    companyName?: string;

    constructor(
        id: number,
        userId: number,
        name: string,
        isActive: boolean,
        email: string,
        companyId?: number,
        description?: string,
        slackUserId?: string,
        displayName?: string,
        role?: string,
        department?: string,
        phone?: string,
        notes?: string,
        avatar?: string,
        employeeId?: number,
        companyName?: string,
        createdAt?: Date,
        updatedAt?: Date
    ) {
        super(id, userId, name, isActive, companyId, description, createdAt, updatedAt);
        this.email = email;
        this.slackUserId = slackUserId;
        this.displayName = displayName;
        this.role = role;
        this.department = department;
        this.phone = phone;
        this.notes = notes;
        this.avatar = avatar;
        this.employeeId = employeeId;
        this.companyName = companyName;
    }
}

// ============================================
// REQUEST MODELS - CREATE
// ============================================
export class CreateMasterModel {
    id?: number;
    userId: number;
    companyId?: number;  // Optional - masters are shared
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
    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, id?: number) {
        super(userId, companyId, name, description, isActive, id);
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
        super(userId, 0, name, description, isActive, id);
    }
}

export class CreateBrandModel extends CreateMasterModel {
    website?: string;
    rating?: number;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, website?: string, rating?: number, id?: number) {
        super(userId, 0, name, description, isActive, id);
        this.website = website;
        this.rating = rating;
    }
}

export class CreateSlackUserModel extends CreateMasterModel {
    email: string;
    slackUserId?: string;
    displayName?: string;
    role?: string;
    department?: string;
    phone?: string;
    notes?: string;
    avatar?: string;
    employeeId?: number;

    constructor(userId: number, companyId: number, name: string, email: string, description?: string, isActive?: boolean, slackUserId?: string, displayName?: string, role?: string, department?: string, phone?: string, notes?: string, avatar?: string, employeeId?: number, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.email = email;
        this.slackUserId = slackUserId;
        this.displayName = displayName;
        this.role = role;
        this.department = department;
        this.phone = phone;
        this.notes = notes;
        this.avatar = avatar;
        this.employeeId = employeeId;
        this.isActive = isActive ?? true;
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
    code?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, defaultPriority?: 'Low' | 'Medium' | 'High', code?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.defaultPriority = defaultPriority;
        this.code = code;
    }
}



export class CreateExpenseCategoryModel extends CreateMasterModel {
    categoryType?: string;
    budgetLimit?: number;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, categoryType?: string, budgetLimit?: number, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.categoryType = categoryType;
        this.budgetLimit = budgetLimit;
    }
}


// ============================================
// REQUEST MODELS - UPDATE
// ============================================
export class UpdateDepartmentModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;

    constructor(id: number, name: string, description?: string, isActive?: boolean) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
    }
}

export class UpdateAssetTypeModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;

    constructor(id: number, name: string, description?: string, isActive?: boolean) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
    }
}

export class UpdateBrandModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    website?: string;
    rating?: number;

    constructor(id: number, name: string, description?: string, isActive?: boolean, website?: string, rating?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.website = website;
        this.rating = rating;
    }
}

export class UpdateVendorModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    companyId?: number;

    constructor(id: number, name: string, description?: string, isActive?: boolean, contactPerson?: string, email?: string, phone?: string, address?: string, companyId?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.companyId = companyId;
    }
}

export class UpdateLocationModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    address?: string;
    city?: string;
    country?: string;

    constructor(id: number, name: string, description?: string, isActive?: boolean, address?: string, city?: string, country?: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.address = address;
        this.city = city;
        this.country = country;
    }
}

export class UpdateTicketCategoryModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    defaultPriority?: 'Low' | 'Medium' | 'High';

    constructor(id: number, name: string, description?: string, isActive?: boolean, defaultPriority?: 'Low' | 'Medium' | 'High') {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.defaultPriority = defaultPriority;
    }
}



export class UpdateExpenseCategoryModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    categoryType?: string;
    budgetLimit?: number;

    constructor(id: number, name: string, description?: string, isActive = true, categoryType?: string, budgetLimit?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.categoryType = categoryType;
        this.budgetLimit = budgetLimit;
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



export class GetAllExpenseCategoriesResponseModel extends GlobalResponse {
    expenseCategories: ExpenseCategory[];

    constructor(status: boolean, code: number, message: string, expenseCategories: ExpenseCategory[]) {
        super(status, code, message);
        this.expenseCategories = expenseCategories;
    }
}


export class GetAllSlackUsersResponseModel extends GlobalResponse {
    slackUsers: SlackUserModel[];

    constructor(status: boolean, code: number, message: string, slackUsers: SlackUserModel[]) {
        super(status, code, message);
        this.slackUsers = slackUsers;
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



export class CreateExpenseCategoryResponseModel extends GlobalResponse {
    expenseCategory: ExpenseCategory;

    constructor(status: boolean, code: number, message: string, expenseCategory: ExpenseCategory) {
        super(status, code, message);
        this.expenseCategory = expenseCategory;
    }
}


// ============================================
// RESPONSE MODELS - UPDATE (Single Item)
// ============================================
export class UpdateDepartmentResponseModel extends GlobalResponse {
    department: Department;

    constructor(status: boolean, code: number, message: string, department: Department) {
        super(status, code, message);
        this.department = department;
    }
}

export class UpdateAssetTypeResponseModel extends GlobalResponse {
    assetType: AssetType;

    constructor(status: boolean, code: number, message: string, assetType: AssetType) {
        super(status, code, message);
        this.assetType = assetType;
    }
}

export class UpdateBrandResponseModel extends GlobalResponse {
    brand: DeviceBrand;

    constructor(status: boolean, code: number, message: string, brand: DeviceBrand) {
        super(status, code, message);
        this.brand = brand;
    }
}

export class UpdateVendorResponseModel extends GlobalResponse {
    vendor: Vendor;

    constructor(status: boolean, code: number, message: string, vendor: Vendor) {
        super(status, code, message);
        this.vendor = vendor;
    }
}

export class UpdateLocationResponseModel extends GlobalResponse {
    location: Location;

    constructor(status: boolean, code: number, message: string, location: Location) {
        super(status, code, message);
        this.location = location;
    }
}

export class UpdateTicketCategoryResponseModel extends GlobalResponse {
    ticketCategory: TicketCategory;

    constructor(status: boolean, code: number, message: string, ticketCategory: TicketCategory) {
        super(status, code, message);
        this.ticketCategory = ticketCategory;
    }
}



export class UpdateExpenseCategoryResponseModel extends GlobalResponse {
    expenseCategory: ExpenseCategory;

    constructor(status: boolean, code: number, message: string, expenseCategory: ExpenseCategory) {
        super(status, code, message);
        this.expenseCategory = expenseCategory;
    }
}


export class CreateSlackUserResponseModel extends GlobalResponse {
    slackUser: SlackUserModel;

    constructor(status: boolean, code: number, message: string, slackUser: SlackUserModel) {
        super(status, code, message);
        this.slackUser = slackUser;
    }
}

export class UpdateSlackUserResponseModel extends GlobalResponse {
    slackUser: SlackUserModel;

    constructor(status: boolean, code: number, message: string, slackUser: SlackUserModel) {
        super(status, code, message);
        this.slackUser = slackUser;
    }
}

export class UpdateSlackUserModel {
    id: number;
    name: string;
    email: string;
    description?: string;
    isActive: boolean;
    slackUserId?: string;
    displayName?: string;
    role?: string;
    department?: string;
    phone?: string;
    notes?: string;
    companyId?: number;
    avatar?: string;
    employeeId?: number;

    constructor(id: number, name: string, email: string, description?: string, isActive = true, slackUserId?: string, displayName?: string, role?: string, department?: string, phone?: string, notes?: string, companyId?: number, avatar?: string, employeeId?: number) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.description = description;
        this.isActive = isActive;
        this.slackUserId = slackUserId;
        this.displayName = displayName;
        this.role = role;
        this.department = department;
        this.phone = phone;
        this.notes = notes;
        this.companyId = companyId;
        this.avatar = avatar;
        this.employeeId = employeeId;
    }
}





// ============================================
// COMPANY MODELS
// ============================================
export class CreateCompanyModel {
    companyName: string;
    location: string;
    estDate: Date;
    email?: string;
    phone?: string;
    userId?: number;
    constructor(companyName: string, location: string, estDate: Date, email?: string, phone?: string, userId?: number) {
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
        this.email = email;
        this.phone = phone;
        this.userId = userId;
    }
}

export class UpdateCompanyModel extends CreateCompanyModel {
    id: number;
    constructor(id: number, companyName: string, location: string, estDate: Date, email?: string, phone?: string, userId?: number) {
        super(companyName, location, estDate, email, phone, userId);
        this.id = id;
    }
}

export class DeleteCompanyModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class GetCompanyModel {
    id: number;
    constructor(id: number) {
        this.id = id;
    }
}

export class CompanyResponseModel {
    id: number;
    companyName: string;
    location: string;
    estDate: Date;
    email: string;
    phone: string;
    constructor(
        id: number,
        companyName: string,
        location: string,
        estDate: Date,
        email: string,
        phone: string
    ) {
        this.id = id;
        this.companyName = companyName;
        this.location = location;
        this.estDate = estDate;
        this.email = email;
        this.phone = phone;
    }
}

export class CompanyResponse extends GlobalResponse {
    data: CompanyResponseModel[];
    constructor(status: boolean, code: number, message: string, data: CompanyResponseModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class CompanyDropdownModel {
    id: number;
    name: string;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class CompanyDropdownResponse extends GlobalResponse {
    data: CompanyDropdownModel[];
    constructor(status: boolean, code: number, message: string, data: CompanyDropdownModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class DepartmentDropdownModel {
    id: number;
    name: string;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class DepartmentDropdownResponse extends GlobalResponse {
    data: DepartmentDropdownModel[];
    constructor(status: boolean, code: number, message: string, data: DepartmentDropdownModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class AssetTypeDropdownModel {
    id: number;
    name: string;
    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class AssetTypeDropdownResponse extends GlobalResponse {
    data: AssetTypeDropdownModel[];
    constructor(status: boolean, code: number, message: string, data: AssetTypeDropdownModel[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class InfrastructureMaster {
    id!: number;
    companyId!: number;
    deviceName!: string;
    serialNumber!: string;
    description?: string;
    purchaseDate?: Date | string;
    isActive?: boolean;
    createdBy!: number;
    updatedBy?: number;
    createdAt!: Date | string;
    updatedAt?: Date | string;
}

export class CreateInfrastructureMasterModel {
    createdBy!: number;
    companyId!: number;
    deviceName!: string;
    serialNumber!: string;
    description?: string;
    purchaseDate?: Date | string;
    isActive?: boolean;

    constructor(
        createdBy: number,
        companyId: number,
        deviceName: string,
        serialNumber: string,
        description?: string,
        purchaseDate?: Date | string,
        isActive?: boolean
    ) {
        this.createdBy = createdBy;
        this.companyId = companyId;
        this.deviceName = deviceName;
        this.serialNumber = serialNumber;
        this.description = description;
        this.purchaseDate = purchaseDate;
        this.isActive = isActive;
    }
}

export class UpdateInfrastructureMasterModel {
    id!: number;
    deviceName?: string;
    serialNumber?: string;
    description?: string;
    purchaseDate?: Date | string;
    isActive?: boolean;

    constructor(
        id: number,
        deviceName?: string,
        serialNumber?: string,
        description?: string,
        purchaseDate?: Date | string,
        isActive?: boolean
    ) {
        this.id = id;
        this.deviceName = deviceName;
        this.serialNumber = serialNumber;
        this.description = description;
        this.purchaseDate = purchaseDate;
        this.isActive = isActive;
    }
}

export class DeleteInfrastructureMasterModel {
    id!: number;
}

export class GetAllInfrastructureMasterResponseModel extends GlobalResponse {
    data: InfrastructureMaster[];
    constructor(status: boolean, code: number, message: string, data: InfrastructureMaster[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class RemoteMaster {
    id!: number;
    companyId!: number;
    remoteToolName!: string;
    userName!: string;
    password!: string;
    notes?: string;
    isActive?: boolean;
    createdBy!: number;
    updatedBy?: number;
    createdAt!: Date | string;
    updatedAt?: Date | string;
}

export class CreateRemoteMasterModel {
    createdBy!: number;
    companyId!: number;
    remoteToolName!: string;
    userName!: string;
    password!: string;
    notes?: string;
    isActive?: boolean;

    constructor(
        createdBy: number,
        companyId: number,
        remoteToolName: string,
        userName: string,
        password: string,
        notes?: string,
        isActive?: boolean
    ) {
        this.createdBy = createdBy;
        this.companyId = companyId;
        this.remoteToolName = remoteToolName;
        this.userName = userName;
        this.password = password;
        this.notes = notes;
        this.isActive = isActive;
    }
}

export class UpdateRemoteMasterModel {
    id!: number;
    remoteToolName?: string;
    userName?: string;
    password?: string;
    notes?: string;
    isActive?: boolean;

    constructor(
        id: number,
        remoteToolName?: string,
        userName?: string,
        password?: string,
        notes?: string,
        isActive?: boolean
    ) {
        this.id = id;
        this.remoteToolName = remoteToolName;
        this.userName = userName;
        this.password = password;
        this.notes = notes;
        this.isActive = isActive;
    }
}

export class DeleteRemoteMasterModel {
    id!: number;
}

export class GetAllRemoteMasterResponseModel extends GlobalResponse {
    data: RemoteMaster[];
    constructor(status: boolean, code: number, message: string, data: RemoteMaster[]) {
        super(status, code, message);
        this.data = data;
    }
}

export class CreateLicenseMasterModel extends CreateMasterModel {
    purchaseDate?: Date;
    expiryDate?: Date;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, purchaseDate?: Date, expiryDate?: Date, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
    }
}

export class UpdateLicenseMasterModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    purchaseDate?: Date;
    expiryDate?: Date;

    constructor(id: number, name: string, description?: string, isActive = true, purchaseDate?: Date, expiryDate?: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.purchaseDate = purchaseDate;
        this.expiryDate = expiryDate;
    }
}

export class GetAllLicenseMastersResponseModel extends GlobalResponse {
    licenses: License[];

    constructor(status: boolean, code: number, message: string, licenses: License[]) {
        super(status, code, message);
        this.licenses = licenses;
    }
}

export class CreateLicenseMasterResponseModel extends GlobalResponse {
    license: License;

    constructor(status: boolean, code: number, message: string, license: License) {
        super(status, code, message);
        this.license = license;
    }
}

export class UpdateLicenseMasterResponseModel extends GlobalResponse {
    license: License;

    constructor(status: boolean, code: number, message: string, license: License) {
        super(status, code, message);
        this.license = license;
    }
}


