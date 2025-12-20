import { CompanyIdRequestModel, CreateAssetTypeModel, CreateAssetTypeResponseModel, CreateBrandModel, CreateBrandResponseModel, CreateDepartmentModel, CreateDepartmentResponseModel, CreateLocationModel, CreateLocationResponseModel, CreateTicketCategoryModel, CreateTicketCategoryResponseModel, CreateVendorModel, CreateVendorResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllDepartmentsResponseModel, GetAllLocationsResponseModel, GetAllTicketCategoriesResponseModel, GetAllVendorsResponseModel, GlobalResponse, IdRequestModel, UpdateAssetTypeModel, UpdateAssetTypeResponseModel, UpdateDepartmentModel, UpdateDepartmentResponseModel } from '@adminvault/shared-models';
import { CommonAxiosService } from '../common-axios-service';

export class MastersService extends CommonAxiosService {
    private readonly BASE_PATH = '/masters';

    async getAllDepartments(companyId: number): Promise<GetAllDepartmentsResponseModel> {
        return await this.axiosPostCall( `${this.BASE_PATH}/getAllDepartments`, new CompanyIdRequestModel(companyId)
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

    async deleteTicketCategory(id: number): Promise<GlobalResponse> {
        return await this.axiosPostCall(
            `${this.BASE_PATH}/deleteTicketCategory`,
            new IdRequestModel(id)
        );
    }
}
