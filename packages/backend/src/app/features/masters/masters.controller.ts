import { Body, Controller, Post, Req } from '@nestjs/common';
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
    async getAllDepartments(): Promise<GetAllDepartmentsResponseModel> {
        try {
            return await this.mastersService.getAllDepartments();
        } catch (error) {
            return returnException(GetAllDepartmentsResponseModel, error);
        }
    }

    @Post('departments')
    async createDepartment(@Body() data: CreateDepartmentModel, @Req() req: any): Promise<CreateDepartmentResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createDepartment(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateDepartmentResponseModel, error);
        }
    }

    @Post('updateDepartment')
    async updateDepartment(@Body() data: UpdateDepartmentModel, @Req() req: any): Promise<UpdateDepartmentResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateDepartment(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateDepartmentResponseModel, error);
        }
    }

    @Post('deleteDepartment')
    async deleteDepartment(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteDepartment(reqModel, userId, ipAddress);
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
    async createAssetType(@Body() data: CreateAssetTypeModel, @Req() req: any): Promise<CreateAssetTypeResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createAssetType(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateAssetTypeResponseModel, error);
        }
    }

    @Post('updateAssetType')
    async updateAssetType(@Body() data: UpdateAssetTypeModel, @Req() req: any): Promise<UpdateAssetTypeResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateAssetType(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateAssetTypeResponseModel, error);
        }
    }

    @Post('deleteAssetType')
    async deleteAssetType(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteAssetType(reqModel, userId, ipAddress);
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
    async createBrand(@Body() data: CreateBrandModel, @Req() req: any): Promise<CreateBrandResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createBrand(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateBrandResponseModel, error);
        }
    }

    @Post('updateBrand')
    async updateBrand(@Body() data: UpdateBrandModel, @Req() req: any): Promise<UpdateBrandResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateBrand(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateBrandResponseModel, error);
        }
    }

    @Post('deleteBrand')
    async deleteBrand(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteBrand(reqModel, userId, ipAddress);
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
    async createVendor(@Body() data: CreateVendorModel, @Req() req: any): Promise<CreateVendorResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createVendor(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateVendorResponseModel, error);
        }
    }

    @Post('updateVendor')
    async updateVendor(@Body() data: UpdateVendorModel, @Req() req: any): Promise<UpdateVendorResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateVendor(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateVendorResponseModel, error);
        }
    }

    @Post('deleteVendor')
    async deleteVendor(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteVendor(reqModel, userId, ipAddress);
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
    async createApplication(@Body() data: CreateApplicationModel, @Req() req: any): Promise<CreateApplicationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createApplication(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateApplicationResponseModel, error);
        }
    }

    @Post('updateApplication')
    async updateApplication(@Body() data: UpdateApplicationModel, @Req() req: any): Promise<UpdateApplicationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateApplication(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateApplicationResponseModel, error);
        }
    }

    @Post('deleteApplication')
    async deleteApplication(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteApplication(reqModel, userId, ipAddress);
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
    async createTicketCategory(@Body() data: CreateTicketCategoryModel, @Req() req: any): Promise<CreateTicketCategoryResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createTicketCategory(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateTicketCategoryResponseModel, error);
        }
    }

    @Post('updateTicketCategory')
    async updateTicketCategory(@Body() data: UpdateTicketCategoryModel, @Req() req: any): Promise<UpdateTicketCategoryResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateTicketCategory(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateTicketCategoryResponseModel, error);
        }
    }

    @Post('deleteTicketCategory')
    async deleteTicketCategory(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteTicketCategory(reqModel, userId, ipAddress);
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
    async createExpenseCategory(@Body() data: CreateExpenseCategoryModel, @Req() req: any): Promise<CreateExpenseCategoryResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createExpenseCategory(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateExpenseCategoryResponseModel, error);
        }
    }

    @Post('updateExpenseCategory')
    async updateExpenseCategory(@Body() data: UpdateExpenseCategoryModel, @Req() req: any): Promise<UpdateExpenseCategoryResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateExpenseCategory(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateExpenseCategoryResponseModel, error);
        }
    }

    @Post('deleteExpenseCategory')
    async deleteExpenseCategory(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteExpenseCategory(reqModel, userId, ipAddress);
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
    async createPasswordVault(@Body() data: CreatePasswordVaultModel, @Req() req: any): Promise<CreatePasswordVaultResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createPasswordVault(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreatePasswordVaultResponseModel, error);
        }
    }

    @Post('updatePasswordVault')
    async updatePasswordVault(@Body() data: UpdatePasswordVaultModel, @Req() req: any): Promise<UpdatePasswordVaultResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updatePasswordVault(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdatePasswordVaultResponseModel, error);
        }
    }

    @Post('deletePasswordVault')
    async deletePasswordVault(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deletePasswordVault(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}

