import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { MastersService } from './masters.service';
import { CreateDepartmentModel, CreateDesignationModel, CreateMasterModel, CreateVendorModel, CreateLocationModel, CreateTicketCategoryModel } from '@adminvault/shared-models';

@Controller('masters')
export class MastersController {
    constructor(private mastersService: MastersService) { }

    // Departments
    @Get('departments')
    async getDepartments() { return this.mastersService.getAllDepartments(); }

    @Post('departments')
    async createDepartment(@Body() data: CreateDepartmentModel) { return this.mastersService.createDepartment(data); }

    @Delete('departments/:id')
    async deleteDepartment(@Param('id') id: number) { return this.mastersService.deleteDepartment(id); }

    // Designations
    @Get('designations')
    async getDesignations() { return this.mastersService.getAllDesignations(); }

    @Post('designations')
    async createDesignation(@Body() data: CreateDesignationModel) { return this.mastersService.createDesignation(data); }

    @Delete('designations/:id')
    async deleteDesignation(@Param('id') id: number) { return this.mastersService.deleteDesignation(id); }

    // Asset Types
    @Get('asset-types')
    async getAssetTypes() { return this.mastersService.getAllAssetTypes(); }

    @Post('asset-types')
    async createAssetType(@Body() data: CreateMasterModel) { return this.mastersService.createAssetType(data); }

    @Delete('asset-types/:id')
    async deleteAssetType(@Param('id') id: number) { return this.mastersService.deleteAssetType(id); }

    // Brands
    @Get('brands')
    async getBrands() { return this.mastersService.getAllBrands(); }

    @Post('brands')
    async createBrand(@Body() data: CreateMasterModel) { return this.mastersService.createBrand(data); }

    @Delete('brands/:id')
    async deleteBrand(@Param('id') id: number) { return this.mastersService.deleteBrand(id); }

    // Vendors
    @Get('vendors')
    async getVendors() { return this.mastersService.getAllVendors(); }

    @Post('vendors')
    async createVendor(@Body() data: CreateVendorModel) { return this.mastersService.createVendor(data); }

    @Delete('vendors/:id')
    async deleteVendor(@Param('id') id: number) { return this.mastersService.deleteVendor(id); }

    // Locations
    @Get('locations')
    async getLocations() { return this.mastersService.getAllLocations(); }

    @Post('locations')
    async createLocation(@Body() data: CreateLocationModel) { return this.mastersService.createLocation(data); }

    @Delete('locations/:id')
    async deleteLocation(@Param('id') id: number) { return this.mastersService.deleteLocation(id); }

    // Ticket Categories
    @Get('ticket-categories')
    async getTicketCategories() { return this.mastersService.getAllTicketCategories(); }

    @Post('ticket-categories')
    async createTicketCategory(@Body() data: CreateTicketCategoryModel) { return this.mastersService.createTicketCategory(data); }

    @Delete('ticket-categories/:id')
    async deleteTicketCategory(@Param('id') id: number) { return this.mastersService.deleteTicketCategory(id); }
}
