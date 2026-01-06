import { GlobalResponse } from '../common/global-response';

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
    companyName?: string;
}

export interface Designation extends MasterBase {
    level?: string;
}

export interface AssetType extends MasterBase {
    code?: string;
    companyName?: string;
    status?: string;
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
    status?: string;
    defaultPriority?: 'Low' | 'Medium' | 'High' | null;
}

export interface Application extends MasterBase {
    ownerName?: string;
    appReleaseDate?: Date;
    companyName?: string;
}

export interface ExpenseCategory extends MasterBase {
    categoryType?: string;
    budgetLimit?: number;
}

export interface PasswordVault extends MasterBase {
    password: string;
    username?: string;
    url?: string;
    notes?: string;
}

export interface SlackUserModel extends MasterBase {
    email: string;
    slackUserId?: string;
    displayName?: string;
    role?: string;
    department?: string;
    phone?: string;
    notes?: string;
    avatar?: string;
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
    code?: string;
    status?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, code?: string, status?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.code = code;
        this.status = status;
    }
}

export class CreateBrandModel extends CreateMasterModel {
    website?: string;
    rating?: number;
    code?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, website?: string, rating?: number, code?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.website = website;
        this.rating = rating;
        this.code = code;
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

    constructor(userId: number, companyId: number, name: string, email: string, description?: string, isActive?: boolean, slackUserId?: string, displayName?: string, role?: string, department?: string, phone?: string, notes?: string, avatar?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.email = email;
        this.slackUserId = slackUserId;
        this.displayName = displayName;
        this.role = role;
        this.department = department;
        this.phone = phone;
        this.notes = notes;
        this.avatar = avatar;
    }
}

export class CreateVendorModel extends CreateMasterModel {
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
    code?: string;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, contactPerson?: string, email?: string, phone?: string, address?: string, code?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.code = code;
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

export class CreateApplicationModel extends CreateMasterModel {
    ownerName?: string;
    appReleaseDate?: Date;

    constructor(userId: number, companyId: number, name: string, description?: string, isActive?: boolean, ownerName?: string, appReleaseDate?: Date, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.ownerName = ownerName;
        this.appReleaseDate = appReleaseDate;
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

export class CreatePasswordVaultModel extends CreateMasterModel {
    password: string;
    username?: string;
    url?: string;
    notes?: string;

    constructor(userId: number, companyId: number, name: string, password: string, description?: string, isActive?: boolean, username?: string, url?: string, notes?: string, id?: number) {
        super(userId, companyId, name, description, isActive, id);
        this.password = password;
        this.username = username;
        this.url = url;
        this.notes = notes;
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
    code?: string;

    constructor(id: number, name: string, description?: string, isActive?: boolean, code?: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.code = code;
    }
}

export class UpdateAssetTypeModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    code?: string;
    companyId?: number;

    constructor(id: number, name: string, description?: string, isActive?: boolean, code?: string, companyId?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.code = code;
        this.companyId = companyId;
    }
}

export class UpdateBrandModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    website?: string;
    rating?: number;
    code?: string;
    companyId?: number;

    constructor(id: number, name: string, description?: string, isActive?: boolean, website?: string, rating?: number, code?: string, companyId?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.website = website;
        this.rating = rating;
        this.code = code;
        this.companyId = companyId;
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
    code?: string;
    companyId?: number;

    constructor(id: number, name: string, description?: string, isActive?: boolean, contactPerson?: string, email?: string, phone?: string, address?: string, code?: string, companyId?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive ?? true;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.code = code;
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

export class UpdateApplicationModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    ownerName?: string;
    appReleaseDate?: Date;

    constructor(id: number, name: string, description?: string, isActive: boolean = true, ownerName?: string, appReleaseDate?: Date) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.ownerName = ownerName;
        this.appReleaseDate = appReleaseDate;
    }
}

export class UpdateExpenseCategoryModel {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    categoryType?: string;
    budgetLimit?: number;

    constructor(id: number, name: string, description?: string, isActive: boolean = true, categoryType?: string, budgetLimit?: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.categoryType = categoryType;
        this.budgetLimit = budgetLimit;
    }
}

export class UpdatePasswordVaultModel {
    id: number;
    name: string;
    password: string;
    description?: string;
    isActive: boolean;
    username?: string;
    url?: string;
    notes?: string;

    constructor(id: number, name: string, password: string, description?: string, isActive: boolean = true, username?: string, url?: string, notes?: string) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.description = description;
        this.isActive = isActive;
        this.username = username;
        this.url = url;
        this.notes = notes;
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

export class GetAllApplicationsResponseModel extends GlobalResponse {
    applications: Application[];

    constructor(status: boolean, code: number, message: string, applications: Application[]) {
        super(status, code, message);
        this.applications = applications;
    }
}

export class GetAllExpenseCategoriesResponseModel extends GlobalResponse {
    expenseCategories: ExpenseCategory[];

    constructor(status: boolean, code: number, message: string, expenseCategories: ExpenseCategory[]) {
        super(status, code, message);
        this.expenseCategories = expenseCategories;
    }
}

export class GetAllPasswordVaultsResponseModel extends GlobalResponse {
    passwordVaults: PasswordVault[];

    constructor(status: boolean, code: number, message: string, passwordVaults: PasswordVault[]) {
        super(status, code, message);
        this.passwordVaults = passwordVaults;
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

export class CreateApplicationResponseModel extends GlobalResponse {
    application: Application;

    constructor(status: boolean, code: number, message: string, application: Application) {
        super(status, code, message);
        this.application = application;
    }
}

export class CreateExpenseCategoryResponseModel extends GlobalResponse {
    expenseCategory: ExpenseCategory;

    constructor(status: boolean, code: number, message: string, expenseCategory: ExpenseCategory) {
        super(status, code, message);
        this.expenseCategory = expenseCategory;
    }
}

export class CreatePasswordVaultResponseModel extends GlobalResponse {
    passwordVault: PasswordVault;

    constructor(status: boolean, code: number, message: string, passwordVault: PasswordVault) {
        super(status, code, message);
        this.passwordVault = passwordVault;
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

export class UpdateApplicationResponseModel extends GlobalResponse {
    application: Application;

    constructor(status: boolean, code: number, message: string, application: Application) {
        super(status, code, message);
        this.application = application;
    }
}

export class UpdateExpenseCategoryResponseModel extends GlobalResponse {
    expenseCategory: ExpenseCategory;

    constructor(status: boolean, code: number, message: string, expenseCategory: ExpenseCategory) {
        super(status, code, message);
        this.expenseCategory = expenseCategory;
    }
}

export class UpdatePasswordVaultResponseModel extends GlobalResponse {
    passwordVault: PasswordVault;

    constructor(status: boolean, code: number, message: string, passwordVault: PasswordVault) {
        super(status, code, message);
        this.passwordVault = passwordVault;
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

    constructor(id: number, name: string, email: string, description?: string, isActive: boolean = true, slackUserId?: string, displayName?: string, role?: string, department?: string, phone?: string, notes?: string, companyId?: number, avatar?: string) {
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
    }
}

