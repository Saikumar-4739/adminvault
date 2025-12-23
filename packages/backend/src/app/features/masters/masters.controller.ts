import { Body, Controller, Post } from '@nestjs/common';
import { MastersService } from './masters.service';
import {
    CreateAssetTypeModel, CreateBrandModel, CreateDepartmentModel, CreateVendorModel, UpdateDepartmentModel, UpdateAssetTypeModel, UpdateBrandModel, UpdateVendorModel,
    CreateApplicationModel, UpdateApplicationModel, CreateExpenseCategoryModel, CreatePasswordVaultModel, UpdatePasswordVaultModel, CreateTicketCategoryModel, UpdateTicketCategoryModel,
    GetAllDepartmentsResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllVendorsResponseModel, GetAllApplicationsResponseModel, GetAllExpenseCategoriesResponseModel, GetAllPasswordVaultsResponseModel, GetAllTicketCategoriesResponseModel,
    CreateDepartmentResponseModel, CreateAssetTypeResponseModel, CreateBrandResponseModel, CreateVendorResponseModel, CreateApplicationResponseModel, CreateExpenseCategoryResponseModel, CreatePasswordVaultResponseModel, CreateTicketCategoryResponseModel,
    UpdateDepartmentResponseModel, UpdateAssetTypeResponseModel, UpdateBrandResponseModel, UpdateVendorResponseModel, UpdateApplicationResponseModel, UpdateExpenseCategoryModel, UpdateExpenseCategoryResponseModel, UpdatePasswordVaultResponseModel, UpdateTicketCategoryResponseModel,
    IdRequestModel, CompanyIdRequestModel
} from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';

@Controller('masters')
export class MastersController {
    constructor(private mastersService: MastersService) { }

    // Departments
    @Post('getAllDepartments')
    async getAllDepartments(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllDepartmentsResponseModel> {
        try {
            return await this.mastersService.getAllDepartments(reqModel);
        } catch (error) {
            return returnException(GetAllDepartmentsResponseModel, error);
        }
    }

    @Post('departments')
    async createDepartment(@Body() data: CreateDepartmentModel): Promise<CreateDepartmentResponseModel> {
        try {
            return await this.mastersService.createDepartment(data);
        } catch (error) {
            return returnException(CreateDepartmentResponseModel, error);
        }
    }

    @Post('updateDepartment')
    async updateDepartment(@Body() data: UpdateDepartmentModel): Promise<UpdateDepartmentResponseModel> {
        try {
            return await this.mastersService.updateDepartment(data);
        } catch (error) {
            return returnException(UpdateDepartmentResponseModel, error);
        }
    }

    @Post('deleteDepartment')
    async deleteDepartment(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteDepartment(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Asset Types
    @Post('getAllAssetTypes')
    async getAllAssetTypes(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllAssetTypesResponseModel> {
        try {
            return await this.mastersService.getAllAssetTypes(reqModel);
        } catch (error) {
            return returnException(GetAllAssetTypesResponseModel, error);
        }
    }

    @Post('asset-types')
    async createAssetType(@Body() data: CreateAssetTypeModel): Promise<CreateAssetTypeResponseModel> {
        try {
            return await this.mastersService.createAssetType(data);
        } catch (error) {
            return returnException(CreateAssetTypeResponseModel, error);
        }
    }

    @Post('updateAssetType')
    async updateAssetType(@Body() data: UpdateAssetTypeModel): Promise<UpdateAssetTypeResponseModel> {
        try {
            return await this.mastersService.updateAssetType(data);
        } catch (error) {
            return returnException(UpdateAssetTypeResponseModel, error);
        }
    }

    @Post('deleteAssetType')
    async deleteAssetType(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteAssetType(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Brands
    @Post('getAllBrands')
    async getAllBrands(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllBrandsResponseModel> {
        try {
            return await this.mastersService.getAllBrands(reqModel);
        } catch (error) {
            return returnException(GetAllBrandsResponseModel, error);
        }
    }

    @Post('brands')
    async createBrand(@Body() data: CreateBrandModel): Promise<CreateBrandResponseModel> {
        try {
            return await this.mastersService.createBrand(data);
        } catch (error) {
            return returnException(CreateBrandResponseModel, error);
        }
    }

    @Post('updateBrand')
    async updateBrand(@Body() data: UpdateBrandModel): Promise<UpdateBrandResponseModel> {
        try {
            return await this.mastersService.updateBrand(data);
        } catch (error) {
            return returnException(UpdateBrandResponseModel, error);
        }
    }

    @Post('deleteBrand')
    async deleteBrand(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteBrand(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Vendors
    @Post('getAllVendors')
    async getAllVendors(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllVendorsResponseModel> {
        try {
            return await this.mastersService.getAllVendors(reqModel);
        } catch (error) {
            return returnException(GetAllVendorsResponseModel, error);
        }
    }

    @Post('vendors')
    async createVendor(@Body() data: CreateVendorModel): Promise<CreateVendorResponseModel> {
        try {
            return await this.mastersService.createVendor(data);
        } catch (error) {
            return returnException(CreateVendorResponseModel, error);
        }
    }

    @Post('updateVendor')
    async updateVendor(@Body() data: UpdateVendorModel): Promise<UpdateVendorResponseModel> {
        try {
            return await this.mastersService.updateVendor(data);
        } catch (error) {
            return returnException(UpdateVendorResponseModel, error);
        }
    }

    @Post('deleteVendor')
    async deleteVendor(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteVendor(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Applications
    @Post('getAllApplications')
    async getAllApplications(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllApplicationsResponseModel> {
        try {
            return await this.mastersService.getAllApplications(reqModel);
        } catch (error) {
            return returnException(GetAllApplicationsResponseModel, error);
        }
    }

    @Post('applications')
    async createApplication(@Body() data: CreateApplicationModel): Promise<CreateApplicationResponseModel> {
        try {
            return await this.mastersService.createApplication(data);
        } catch (error) {
            return returnException(CreateApplicationResponseModel, error);
        }
    }

    @Post('updateApplication')
    async updateApplication(@Body() data: UpdateApplicationModel): Promise<UpdateApplicationResponseModel> {
        try {
            return await this.mastersService.updateApplication(data);
        } catch (error) {
            return returnException(UpdateApplicationResponseModel, error);
        }
    }

    @Post('deleteApplication')
    async deleteApplication(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteApplication(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Ticket Categories
    @Post('getAllTicketCategories')
    async getAllTicketCategories(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllTicketCategoriesResponseModel> {
        try {
            return await this.mastersService.getAllTicketCategories(reqModel);
        } catch (error) {
            return returnException(GetAllTicketCategoriesResponseModel, error);
        }
    }

    @Post('ticket-categories')
    async createTicketCategory(@Body() data: CreateTicketCategoryModel): Promise<CreateTicketCategoryResponseModel> {
        try {
            return await this.mastersService.createTicketCategory(data);
        } catch (error) {
            return returnException(CreateTicketCategoryResponseModel, error);
        }
    }

    @Post('updateTicketCategory')
    async updateTicketCategory(@Body() data: UpdateTicketCategoryModel): Promise<UpdateTicketCategoryResponseModel> {
        try {
            return await this.mastersService.updateTicketCategory(data);
        } catch (error) {
            return returnException(UpdateTicketCategoryResponseModel, error);
        }
    }

    @Post('deleteTicketCategory')
    async deleteTicketCategory(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteTicketCategory(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Expense Categories
    @Post('getAllExpenseCategories')
    async getAllExpenseCategories(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllExpenseCategoriesResponseModel> {
        try {
            return await this.mastersService.getAllExpenseCategories(reqModel);
        } catch (error) {
            return returnException(GetAllExpenseCategoriesResponseModel, error);
        }
    }

    @Post('expense-categories')
    async createExpenseCategory(@Body() data: CreateExpenseCategoryModel): Promise<CreateExpenseCategoryResponseModel> {
        try {
            return await this.mastersService.createExpenseCategory(data);
        } catch (error) {
            return returnException(CreateExpenseCategoryResponseModel, error);
        }
    }

    @Post('updateExpenseCategory')
    async updateExpenseCategory(@Body() data: UpdateExpenseCategoryModel): Promise<UpdateExpenseCategoryResponseModel> {
        try {
            return await this.mastersService.updateExpenseCategory(data);
        } catch (error) {
            return returnException(UpdateExpenseCategoryResponseModel, error);
        }
    }

    @Post('deleteExpenseCategory')
    async deleteExpenseCategory(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteExpenseCategory(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Password Vaults
    @Post('getAllPasswordVaults')
    async getAllPasswordVaults(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.mastersService.getAllPasswordVaults(reqModel);
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('password-vaults')
    async createPasswordVault(@Body() data: CreatePasswordVaultModel): Promise<CreatePasswordVaultResponseModel> {
        try {
            return await this.mastersService.createPasswordVault(data);
        } catch (error) {
            return returnException(CreatePasswordVaultResponseModel, error);
        }
    }

    @Post('updatePasswordVault')
    async updatePasswordVault(@Body() data: UpdatePasswordVaultModel): Promise<UpdatePasswordVaultResponseModel> {
        try {
            return await this.mastersService.updatePasswordVault(data);
        } catch (error) {
            return returnException(UpdatePasswordVaultResponseModel, error);
        }
    }

    @Post('deletePasswordVault')
    async deletePasswordVault(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deletePasswordVault(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}

