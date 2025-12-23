import {
    CompanyIdRequestModel, CreateAssetTypeModel, CreateAssetTypeResponseModel, CreateBrandModel, CreateBrandResponseModel, CreateDepartmentModel, CreateDepartmentResponseModel, CreateLocationModel, CreateLocationResponseModel, CreateTicketCategoryModel, CreateTicketCategoryResponseModel, CreateVendorModel, CreateVendorResponseModel, CreateApplicationModel, CreateApplicationResponseModel, CreateExpenseCategoryModel, CreateExpenseCategoryResponseModel, CreatePasswordVaultModel, CreatePasswordVaultResponseModel,
    GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllDepartmentsResponseModel, GetAllLocationsResponseModel, GetAllTicketCategoriesResponseModel, GetAllVendorsResponseModel, GetAllApplicationsResponseModel, GetAllExpenseCategoriesResponseModel, GetAllPasswordVaultsResponseModel,
    GlobalResponse, IdRequestModel, UpdateAssetTypeModel, UpdateAssetTypeResponseModel, UpdateBrandModel, UpdateBrandResponseModel, UpdateDepartmentModel, UpdateDepartmentResponseModel, UpdateTicketCategoryModel, UpdateTicketCategoryResponseModel, UpdateVendorModel, UpdateVendorResponseModel, UpdateApplicationModel, UpdateApplicationResponseModel, UpdateExpenseCategoryModel, UpdateExpenseCategoryResponseModel, UpdatePasswordVaultModel, UpdatePasswordVaultResponseModel
} from '@adminvault/shared-models';
import { CommonAxiosService } from '../common-axios-service';

export class MastersService extends CommonAxiosService {
    private readonly BASE_PATH = '/masters';

    async getAllDepartments(companyId: number): Promise<GetAllDepartmentsResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/getAllDepartments`, new CompanyIdRequestModel(companyId)
        );
    }

    async createDepartment(data: CreateDepartmentModel): Promise<CreateDepartmentResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/departments`, data);
    }

    async updateDepartment(data: UpdateDepartmentModel): Promise<UpdateDepartmentResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateDepartment`, data);
    }

    async deleteDepartment(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteDepartment`,
            new IdRequestModel(id)
        );
    }

    // ============================================
    // ASSET TYPES
    // ============================================
    async getAllAssetTypes(companyId: number): Promise<GetAllAssetTypesResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllAssetTypes`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createAssetType(data: CreateAssetTypeModel): Promise<CreateAssetTypeResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/asset-types`, data);
    }

    async updateAssetType(data: UpdateAssetTypeModel): Promise<UpdateAssetTypeResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateAssetType`, data);
    }

    async deleteAssetType(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteAssetType`,
            new IdRequestModel(id)
        );
    }

    // ============================================
    // BRANDS
    // ============================================
    async getAllBrands(companyId: number): Promise<GetAllBrandsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllBrands`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createBrand(data: CreateBrandModel): Promise<CreateBrandResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/brands`, data);
    }

    async updateBrand(data: UpdateBrandModel): Promise<UpdateBrandResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateBrand`, data);
    }

    async deleteBrand(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteBrand`,
            new IdRequestModel(id)
        );
    }

    // ============================================
    // VENDORS
    // ============================================
    async getAllVendors(companyId: number): Promise<GetAllVendorsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllVendors`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createVendor(data: CreateVendorModel): Promise<CreateVendorResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/vendors`, data);
    }

    async updateVendor(data: UpdateVendorModel): Promise<UpdateVendorResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateVendor`, data);
    }

    async deleteVendor(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteVendor`,
            new IdRequestModel(id)
        );
    }

    // ============================================
    // LOCATIONS
    // ============================================
    async getAllLocations(companyId: number): Promise<GetAllLocationsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllLocations`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createLocation(data: CreateLocationModel): Promise<CreateLocationResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/locations`, data);
    }

    async deleteLocation(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteLocation`,
            new IdRequestModel(id)
        );
    }

    // ============================================
    // TICKET CATEGORIES
    // ============================================
    async getAllTicketCategories(companyId: number): Promise<GetAllTicketCategoriesResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllTicketCategories`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createTicketCategory(data: CreateTicketCategoryModel): Promise<CreateTicketCategoryResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/ticket-categories`, data);
    }

    async updateTicketCategory(data: UpdateTicketCategoryModel): Promise<UpdateTicketCategoryResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateTicketCategory`, data);
    }

    async deleteTicketCategory(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteTicketCategory`,
            new IdRequestModel(id)
        );
    }

    // ============================================
    // APPLICATIONS
    // ============================================
    async getAllApplications(companyId: number): Promise<GetAllApplicationsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllApplications`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createApplication(data: CreateApplicationModel): Promise<CreateApplicationResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/applications`, data);
    }

    async updateApplication(data: UpdateApplicationModel): Promise<UpdateApplicationResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateApplication`, data);
    }

    async deleteApplication(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteApplication`,
            new IdRequestModel(id)
        );
    }

    // Expense Categories
    async getAllExpenseCategories(companyId: number): Promise<GetAllExpenseCategoriesResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllExpenseCategories`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createExpenseCategory(data: CreateExpenseCategoryModel): Promise<CreateExpenseCategoryResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/expense-categories`, data);
    }

    async updateExpenseCategory(data: UpdateExpenseCategoryModel): Promise<UpdateExpenseCategoryResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updateExpenseCategory`, data);
    }

    async deleteExpenseCategory(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteExpenseCategory`,
            new IdRequestModel(id)
        );
    }

    // ============================================
    // PASSWORD VAULTS
    // ============================================
    async getAllPasswordVaults(companyId: number): Promise<GetAllPasswordVaultsResponseModel> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/getAllPasswordVaults`,
            new CompanyIdRequestModel(companyId)
        );
    }

    async createPasswordVault(data: CreatePasswordVaultModel): Promise<CreatePasswordVaultResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/password-vaults`, data);
    }

    async updatePasswordVault(data: UpdatePasswordVaultModel): Promise<UpdatePasswordVaultResponseModel> {
        return await this.axiosPostCall(`${this.BASE_PATH}/updatePasswordVault`, data);
    }

    async deletePasswordVault(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deletePasswordVault`,
            new IdRequestModel(id)
        );
    }
}
