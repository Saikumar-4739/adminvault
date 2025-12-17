import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MastersService } from './masters.service';
import {
    CreateAssetTypeModel, CreateBrandModel, CreateDepartmentModel, CreateDesignationModel,
    CreateLocationModel, CreateTicketCategoryModel, CreateVendorModel,
    GetAllDepartmentsResponseModel, GetAllDesignationsResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllVendorsResponseModel, GetAllLocationsResponseModel, GetAllTicketCategoriesResponseModel,
    CreateDepartmentResponseModel, CreateDesignationResponseModel, CreateAssetTypeResponseModel, CreateBrandResponseModel, CreateVendorResponseModel, CreateLocationResponseModel, CreateTicketCategoryResponseModel,
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

    @Post('deleteVendor')
    async deleteVendor(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteVendor(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }

    // Locations
    @Post('getAllLocations')
    async getAllLocations(@Body() reqModel: CompanyIdRequestModel): Promise<GetAllLocationsResponseModel> {
        try {
            return await this.mastersService.getAllLocations(reqModel);
        } catch (error) {
            return returnException(GetAllLocationsResponseModel, error);
        }
    }

    @Post('locations')
    async createLocation(@Body() data: CreateLocationModel): Promise<CreateLocationResponseModel> {
        try {
            return await this.mastersService.createLocation(data);
        } catch (error) {
            return returnException(CreateLocationResponseModel, error);
        }
    }

    @Post('deleteLocation')
    async deleteLocation(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteLocation(reqModel);
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

    @Post('deleteTicketCategory')
    async deleteTicketCategory(@Body() reqModel: IdRequestModel): Promise<GlobalResponse> {
        try {
            return await this.mastersService.deleteTicketCategory(reqModel);
        } catch (error) {
            return returnException(GlobalResponse, error);
        }
    }
}
