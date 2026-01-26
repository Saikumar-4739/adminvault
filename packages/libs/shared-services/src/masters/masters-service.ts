import { CompanyIdRequestModel, CreateAssetTypeModel, CreateAssetTypeResponseModel, CreateBrandModel, CreateBrandResponseModel, CreateDepartmentModel, CreateDepartmentResponseModel, CreateLocationModel, CreateLocationResponseModel, CreateTicketCategoryModel, CreateTicketCategoryResponseModel, CreateVendorModel, CreateVendorResponseModel, CreateApplicationModel, CreateApplicationResponseModel, CreateExpenseCategoryModel, CreateExpenseCategoryResponseModel, CreatePasswordVaultModel, CreatePasswordVaultResponseModel, CreateSlackUserModel, CreateSlackUserResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllDepartmentsResponseModel, GetAllLocationsResponseModel, GetAllTicketCategoriesResponseModel, GetAllVendorsResponseModel, GetAllApplicationsResponseModel, GetAllExpenseCategoriesResponseModel, GetAllPasswordVaultsResponseModel, GetAllSlackUsersResponseModel, GlobalResponse, IdRequestModel, UpdateAssetTypeModel, UpdateAssetTypeResponseModel, UpdateBrandModel, UpdateBrandResponseModel, UpdateDepartmentModel, UpdateDepartmentResponseModel, UpdateLocationModel, UpdateLocationResponseModel, UpdateTicketCategoryModel, UpdateTicketCategoryResponseModel, UpdateVendorModel, UpdateVendorResponseModel, UpdateApplicationModel, UpdateApplicationResponseModel, UpdateExpenseCategoryModel, UpdateExpenseCategoryResponseModel, UpdatePasswordVaultModel, UpdatePasswordVaultResponseModel, UpdateSlackUserModel, UpdateSlackUserResponseModel } from '@adminvault/shared-models';
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
    async deleteDepartment(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteDepartment'), reqObj, config);
    }

    async getAllAssetTypes(config?: AxiosRequestConfig): Promise<GetAllAssetTypesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllAssetTypes'), {}, config);
    }
    async createAssetType(data: CreateAssetTypeModel, config?: AxiosRequestConfig): Promise<CreateAssetTypeResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('asset-types'), data, config);
    }
    async updateAssetType(data: UpdateAssetTypeModel, config?: AxiosRequestConfig): Promise<UpdateAssetTypeResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateAssetType'), data, config);
    }
    async deleteAssetType(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteAssetType'), reqObj, config);
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
    async deleteBrand(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteBrand'), reqObj, config);
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
    async deleteVendor(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteVendor'), reqObj, config);
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
    async deleteApplication(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteApplication'), reqObj, config);
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
    async deleteTicketCategory(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteTicketCategory'), reqObj, config);
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
    async deleteExpenseCategory(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteExpenseCategory'), reqObj, config);
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
    async deletePasswordVault(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deletePasswordVault'), reqObj, config);
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
    async deleteLocation(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteLocation'), reqObj, config);
    }

    async getAllSlackUsers(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllSlackUsersResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllSlackUsers'), reqObj, config);
    }
    async createSlackUser(data: CreateSlackUserModel, config?: AxiosRequestConfig): Promise<CreateSlackUserResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createSlackUser'), data, config);
    }
    async updateSlackUser(data: UpdateSlackUserModel, config?: AxiosRequestConfig): Promise<UpdateSlackUserResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateSlackUser'), data, config);
    }
    async deleteSlackUser(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteSlackUser'), reqObj, config);
    }
}
