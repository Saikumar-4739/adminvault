import { CompanyIdRequestModel, CreateAssetTypeModel, CreateAssetTypeResponseModel, CreateBrandModel, CreateBrandResponseModel, CreateDepartmentModel, CreateDepartmentResponseModel, CreateLocationModel, CreateLocationResponseModel, CreateTicketCategoryModel, CreateTicketCategoryResponseModel, CreateVendorModel, CreateVendorResponseModel, CreateApplicationModel, CreateApplicationResponseModel, CreateExpenseCategoryModel, CreateExpenseCategoryResponseModel, CreatePasswordVaultModel, CreatePasswordVaultResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllDepartmentsResponseModel, GetAllLocationsResponseModel, GetAllTicketCategoriesResponseModel, GetAllVendorsResponseModel, GetAllApplicationsResponseModel, GetAllExpenseCategoriesResponseModel, GetAllPasswordVaultsResponseModel, GlobalResponse, IdRequestModel, UpdateAssetTypeModel, UpdateAssetTypeResponseModel, UpdateBrandModel, UpdateBrandResponseModel, UpdateDepartmentModel, UpdateDepartmentResponseModel, UpdateLocationModel, UpdateLocationResponseModel, UpdateTicketCategoryModel, UpdateTicketCategoryResponseModel, UpdateVendorModel, UpdateVendorResponseModel, UpdateApplicationModel, UpdateApplicationResponseModel, UpdateExpenseCategoryModel, UpdateExpenseCategoryResponseModel, UpdatePasswordVaultModel, UpdatePasswordVaultResponseModel } from '@adminvault/shared-models';
import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';

export class MastersService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllDepartments(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllDepartmentsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllDepartments'), reqObj, config);
    }
    async createDepartment(data: CreateDepartmentModel, config?: AxiosRequestConfig): Promise<CreateDepartmentResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('departments'), data, config);
    }
    async updateDepartment(data: UpdateDepartmentModel, config?: AxiosRequestConfig): Promise<UpdateDepartmentResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateDepartment'), data, config);
    }
    async deleteDepartment(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteDepartment'), { id }, config);
    }

    async getAllAssetTypes(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllAssetTypesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllAssetTypes'), reqObj, config);
    }
    async createAssetType(data: CreateAssetTypeModel, config?: AxiosRequestConfig): Promise<CreateAssetTypeResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('asset-types'), data, config);
    }
    async updateAssetType(data: UpdateAssetTypeModel, config?: AxiosRequestConfig): Promise<UpdateAssetTypeResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateAssetType'), data, config);
    }
    async deleteAssetType(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteAssetType'), { id }, config);
    }

    async getAllBrands(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllBrandsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllBrands'), reqObj, config);
    }
    async createBrand(data: CreateBrandModel, config?: AxiosRequestConfig): Promise<CreateBrandResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('brands'), data, config);
    }
    async updateBrand(data: UpdateBrandModel, config?: AxiosRequestConfig): Promise<UpdateBrandResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateBrand'), data, config);
    }
    async deleteBrand(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteBrand'), { id }, config);
    }

    async getAllVendors(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllVendorsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllVendors'), reqObj, config);
    }
    async createVendor(data: CreateVendorModel, config?: AxiosRequestConfig): Promise<CreateVendorResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('vendors'), data, config);
    }
    async updateVendor(data: UpdateVendorModel, config?: AxiosRequestConfig): Promise<UpdateVendorResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateVendor'), data, config);
    }
    async deleteVendor(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteVendor'), { id }, config);
    }

    async getAllApplications(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllApplicationsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllApplications'), reqObj, config);
    }
    async createApplication(data: CreateApplicationModel, config?: AxiosRequestConfig): Promise<CreateApplicationResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('applications'), data, config);
    }
    async updateApplication(data: UpdateApplicationModel, config?: AxiosRequestConfig): Promise<UpdateApplicationResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateApplication'), data, config);
    }
    async deleteApplication(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteApplication'), { id }, config);
    }

    async getAllTicketCategories(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllTicketCategoriesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllTicketCategories'), reqObj, config);
    }
    async createTicketCategory(data: CreateTicketCategoryModel, config?: AxiosRequestConfig): Promise<CreateTicketCategoryResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('ticket-categories'), data, config);
    }
    async updateTicketCategory(data: UpdateTicketCategoryModel, config?: AxiosRequestConfig): Promise<UpdateTicketCategoryResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateTicketCategory'), data, config);
    }
    async deleteTicketCategory(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteTicketCategory'), { id }, config);
    }

    async getAllExpenseCategories(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllExpenseCategoriesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllExpenseCategories'), reqObj, config);
    }
    async createExpenseCategory(data: CreateExpenseCategoryModel, config?: AxiosRequestConfig): Promise<CreateExpenseCategoryResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('expense-categories'), data, config);
    }
    async updateExpenseCategory(data: UpdateExpenseCategoryModel, config?: AxiosRequestConfig): Promise<UpdateExpenseCategoryResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateExpenseCategory'), data, config);
    }
    async deleteExpenseCategory(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteExpenseCategory'), { id }, config);
    }

    async getAllPasswordVaults(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllPasswordVaultsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllPasswordVaults'), reqObj, config);
    }
    async createPasswordVault(data: CreatePasswordVaultModel, config?: AxiosRequestConfig): Promise<CreatePasswordVaultResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('password-vaults'), data, config);
    }
    async updatePasswordVault(data: UpdatePasswordVaultModel, config?: AxiosRequestConfig): Promise<UpdatePasswordVaultResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updatePasswordVault'), data, config);
    }
    async deletePasswordVault(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deletePasswordVault'), { id }, config);
    }

    async getAllLocations(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllLocationsResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllLocations'), reqObj, config);
    }
    async createLocation(data: CreateLocationModel, config?: AxiosRequestConfig): Promise<CreateLocationResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('locations'), data, config);
    }
    async updateLocation(data: UpdateLocationModel, config?: AxiosRequestConfig): Promise<UpdateLocationResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateLocation'), data, config);
    }
    async deleteLocation(id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteLocation'), { id }, config);
    }
}
