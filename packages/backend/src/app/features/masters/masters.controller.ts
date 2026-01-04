import { Body, Controller, Post, Req } from '@nestjs/common';
import { MastersService } from './masters.service';
import {
    CreateAssetTypeModel, CreateBrandModel, CreateDepartmentModel, CreateVendorModel, UpdateDepartmentModel, UpdateAssetTypeModel, UpdateBrandModel, UpdateVendorModel,
    CreateApplicationModel, UpdateApplicationModel, CreateExpenseCategoryModel, CreatePasswordVaultModel, UpdatePasswordVaultModel, CreateTicketCategoryModel, UpdateTicketCategoryModel, CreateLocationModel, UpdateLocationModel,
    GetAllDepartmentsResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllVendorsResponseModel, GetAllApplicationsResponseModel, GetAllExpenseCategoriesResponseModel, GetAllPasswordVaultsResponseModel, GetAllTicketCategoriesResponseModel, GetAllLocationsResponseModel,
    CreateDepartmentResponseModel, CreateAssetTypeResponseModel, CreateBrandResponseModel, CreateVendorResponseModel, CreateApplicationResponseModel, CreateExpenseCategoryResponseModel, CreatePasswordVaultResponseModel, CreateTicketCategoryResponseModel, CreateLocationResponseModel,
    UpdateDepartmentResponseModel, UpdateAssetTypeResponseModel, UpdateBrandResponseModel, UpdateVendorResponseModel, UpdateApplicationResponseModel, UpdateExpenseCategoryModel, UpdateExpenseCategoryResponseModel, UpdatePasswordVaultResponseModel, UpdateTicketCategoryResponseModel, UpdateLocationResponseModel,
    IdRequestModel, CompanyIdRequestModel
} from '@adminvault/shared-models';
import { GlobalResponse, returnException } from '@adminvault/backend-utils';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Masters')
@Controller('masters')
export class MastersController {
    constructor(private mastersService: MastersService) { }

    // Departments
    @Post('getAllDepartments')
    @ApiOperation({ summary: 'Get all departments' })
    async getAllDepartments(): Promise<GetAllDepartmentsResponseModel> {
        try {
            return await this.mastersService.getAllDepartments();
        } catch (error) {
            return returnException(GetAllDepartmentsResponseModel, error);
        }
    }

    @Post('departments')
    @ApiOperation({ summary: 'Create department' })
    @ApiBody({ type: CreateDepartmentModel })
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
    @ApiOperation({ summary: 'Update department' })
    @ApiBody({ type: UpdateDepartmentModel })
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
    @ApiOperation({ summary: 'Delete department' })
    @ApiBody({ type: IdRequestModel })
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
    @ApiOperation({ summary: 'Get all asset types' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllAssetTypes(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllAssetTypesResponseModel> {
        try {
            return await this.mastersService.getAllAssetTypes(reqModel);
        } catch (error) {
            return returnException(GetAllAssetTypesResponseModel, error);
        }
    }

    @Post('asset-types')
    @ApiOperation({ summary: 'Create asset type' })
    @ApiBody({ type: CreateAssetTypeModel })
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
    @ApiOperation({ summary: 'Update asset type' })
    @ApiBody({ type: UpdateAssetTypeModel })
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
    @ApiOperation({ summary: 'Delete asset type' })
    @ApiBody({ type: IdRequestModel })
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
    @ApiOperation({ summary: 'Get all brands' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllBrands(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllBrandsResponseModel> {
        try {
            return await this.mastersService.getAllBrands(reqModel);
        } catch (error) {
            return returnException(GetAllBrandsResponseModel, error);
        }
    }

    @Post('brands')
    @ApiOperation({ summary: 'Create brand' })
    @ApiBody({ type: CreateBrandModel })
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
    @ApiOperation({ summary: 'Update brand' })
    @ApiBody({ type: UpdateBrandModel })
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
    @ApiOperation({ summary: 'Delete brand' })
    @ApiBody({ type: IdRequestModel })
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
    @ApiOperation({ summary: 'Get all vendors' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllVendors(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllVendorsResponseModel> {
        try {
            return await this.mastersService.getAllVendors(reqModel);
        } catch (error) {
            return returnException(GetAllVendorsResponseModel, error);
        }
    }

    @Post('vendors')
    @ApiOperation({ summary: 'Create vendor' })
    @ApiBody({ type: CreateVendorModel })
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
    @ApiOperation({ summary: 'Update vendor' })
    @ApiBody({ type: UpdateVendorModel })
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
    @ApiOperation({ summary: 'Delete vendor' })
    @ApiBody({ type: IdRequestModel })
    async deleteVendor(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteVendor(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Locations
    @Post('getAllLocations')
    @ApiOperation({ summary: 'Get all locations' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllLocations(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllLocationsResponseModel> {
        try {
            return await this.mastersService.getAllLocations(reqModel);
        } catch (error) {
            return returnException(GetAllLocationsResponseModel, error);
        }
    }

    @Post('locations')
    @ApiOperation({ summary: 'Create location' })
    @ApiBody({ type: CreateLocationModel })
    async createLocation(@Body() data: CreateLocationModel, @Req() req: any): Promise<CreateLocationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.createLocation(data, userId, ipAddress);
        } catch (error) {
            return returnException(CreateLocationResponseModel, error);
        }
    }

    @Post('updateLocation')
    @ApiOperation({ summary: 'Update location' })
    @ApiBody({ type: UpdateLocationModel })
    async updateLocation(@Body() data: UpdateLocationModel, @Req() req: any): Promise<UpdateLocationResponseModel> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.updateLocation(data, userId, ipAddress);
        } catch (error) {
            return returnException(UpdateLocationResponseModel, error);
        }
    }

    @Post('deleteLocation')
    @ApiOperation({ summary: 'Delete location' })
    @ApiBody({ type: IdRequestModel })
    async deleteLocation(@Body() reqModel: IdRequestModel, @Req() req: any): Promise<GlobalResponse> {
        try {
            const userId = req.user?.id || req.user?.userId;
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            return await this.mastersService.deleteLocation(reqModel, userId, ipAddress);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Applications
    @Post('getAllApplications')
    @ApiOperation({ summary: 'Get all applications' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllApplications(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllApplicationsResponseModel> {
        try {
            return await this.mastersService.getAllApplications(reqModel);
        } catch (error) {
            return returnException(GetAllApplicationsResponseModel, error);
        }
    }

    @Post('applications')
    @ApiOperation({ summary: 'Create application' })
    @ApiBody({ type: CreateApplicationModel })
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
    @ApiOperation({ summary: 'Update application' })
    @ApiBody({ type: UpdateApplicationModel })
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
    @ApiOperation({ summary: 'Delete application' })
    @ApiBody({ type: IdRequestModel })
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
    @ApiOperation({ summary: 'Get all ticket categories' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllTicketCategories(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllTicketCategoriesResponseModel> {
        try {
            return await this.mastersService.getAllTicketCategories(reqModel);
        } catch (error) {
            return returnException(GetAllTicketCategoriesResponseModel, error);
        }
    }

    @Post('ticket-categories')
    @ApiOperation({ summary: 'Create ticket category' })
    @ApiBody({ type: CreateTicketCategoryModel })
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
    @ApiOperation({ summary: 'Update ticket category' })
    @ApiBody({ type: UpdateTicketCategoryModel })
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
    @ApiOperation({ summary: 'Delete ticket category' })
    @ApiBody({ type: IdRequestModel })
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
    @ApiOperation({ summary: 'Get all expense categories' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllExpenseCategories(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllExpenseCategoriesResponseModel> {
        try {
            return await this.mastersService.getAllExpenseCategories(reqModel);
        } catch (error) {
            return returnException(GetAllExpenseCategoriesResponseModel, error);
        }
    }

    @Post('expense-categories')
    @ApiOperation({ summary: 'Create expense category' })
    @ApiBody({ type: CreateExpenseCategoryModel })
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
    @ApiOperation({ summary: 'Update expense category' })
    @ApiBody({ type: UpdateExpenseCategoryModel })
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
    @ApiOperation({ summary: 'Delete expense category' })
    @ApiBody({ type: IdRequestModel })
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
    @ApiOperation({ summary: 'Get all password vaults' })
    @ApiBody({ type: CompanyIdRequestModel })
    async getAllPasswordVaults(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            return await this.mastersService.getAllPasswordVaults(reqModel);
        } catch (error) {
            return returnException(GetAllPasswordVaultsResponseModel, error);
        }
    }

    @Post('password-vaults')
    @ApiOperation({ summary: 'Create password vault' })
    @ApiBody({ type: CreatePasswordVaultModel })
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
    @ApiOperation({ summary: 'Update password vault' })
    @ApiBody({ type: UpdatePasswordVaultModel })
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
    @ApiOperation({ summary: 'Delete password vault' })
    @ApiBody({ type: IdRequestModel })
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

