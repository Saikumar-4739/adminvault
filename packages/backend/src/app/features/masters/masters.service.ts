import { Injectable } from '@nestjs/common';
import { DepartmentRepository, DesignationRepository, AssetTypeRepository, BrandRepository, VendorRepository, LocationRepository, TicketCategoryRepository } from '../../repository/masters/masters.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateMasterModel, CreateDepartmentModel, CreateDesignationModel, CreateVendorModel, CreateLocationModel, CreateTicketCategoryModel } from '@adminvault/shared-models';
import { DepartmentEntity } from '../../entities/masters/department.entity';
import { DesignationEntity } from '../../entities/masters/designation.entity';
import { AssetTypeEntity } from '../../entities/masters/asset-type.entity';
import { BrandEntity } from '../../entities/masters/brand.entity';
import { VendorEntity } from '../../entities/masters/vendor.entity';
import { LocationEntity } from '../../entities/masters/location.entity';
import { TicketCategoryEntity } from '../../entities/masters/ticket-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MastersService {
    constructor(
        private deptRepo: DepartmentRepository,
        private desgRepo: DesignationRepository,
        private assetTypeRepo: AssetTypeRepository,
        private brandRepo: BrandRepository,
        private vendorRepo: VendorRepository,
        private locationRepo: LocationRepository,
        private ticketCatRepo: TicketCategoryRepository,
    ) { }

    // Generic Helpers
    private async getAll<T>(repo: Repository<T>, name: string) {
        try {
            const items = await repo.find();
            return new GlobalResponse(true, 200, `${name} retrieved successfully`, items);
        } catch (error) {
            throw new ErrorResponse(500, `Failed to fetch ${name}`);
        }
    }

    private async create<T>(repo: Repository<T>, entity: any, name: string) {
        try {
            const newItem = repo.create(entity);
            await repo.save(newItem);
            return new GlobalResponse(true, 201, `${name} created successfully`, newItem);
        } catch (error) {
            throw new ErrorResponse(500, `Failed to create ${name}`);
        }
    }

    // I will implement specific methods to ensure type safety and proper mapping

    // Departments
    async getAllDepartments() { return this.getAll(this.deptRepo, 'Departments'); }
    async createDepartment(data: CreateDepartmentModel) { return this.create(this.deptRepo, data, 'Department'); }
    async deleteDepartment(id: number) { await this.deptRepo.delete(id); return new GlobalResponse(true, 200, 'Department deleted'); }

    // Designations
    async getAllDesignations() { return this.getAll(this.desgRepo, 'Designations'); }
    async createDesignation(data: CreateDesignationModel) { return this.create(this.desgRepo, data, 'Designation'); }
    async deleteDesignation(id: number) { await this.desgRepo.delete(id); return new GlobalResponse(true, 200, 'Designation deleted'); }

    // Asset Types
    async getAllAssetTypes() { return this.getAll(this.assetTypeRepo, 'Asset Types'); }
    async createAssetType(data: CreateMasterModel) { return this.create(this.assetTypeRepo, data, 'Asset Type'); }
    async deleteAssetType(id: number) { await this.assetTypeRepo.delete(id); return new GlobalResponse(true, 200, 'Asset Type deleted'); }

    // Brands
    async getAllBrands() { return this.getAll(this.brandRepo, 'Brands'); }
    async createBrand(data: CreateMasterModel) { return this.create(this.brandRepo, data, 'Brand'); } // Brand uses MasterBase mostly, add website if needed in DTO
    async deleteBrand(id: number) { await this.brandRepo.delete(id); return new GlobalResponse(true, 200, 'Brand deleted'); }

    // Vendors
    async getAllVendors() { return this.getAll(this.vendorRepo, 'Vendors'); }
    async createVendor(data: CreateVendorModel) { return this.create(this.vendorRepo, data, 'Vendor'); }
    async deleteVendor(id: number) { await this.vendorRepo.delete(id); return new GlobalResponse(true, 200, 'Vendor deleted'); }

    // Locations
    async getAllLocations() { return this.getAll(this.locationRepo, 'Locations'); }
    async createLocation(data: CreateLocationModel) { return this.create(this.locationRepo, data, 'Location'); }
    async deleteLocation(id: number) { await this.locationRepo.delete(id); return new GlobalResponse(true, 200, 'Location deleted'); }

    // Ticket Categories
    async getAllTicketCategories() { return this.getAll(this.ticketCatRepo, 'Ticket Categories'); }
    async createTicketCategory(data: CreateTicketCategoryModel) { return this.create(this.ticketCatRepo, data, 'Ticket Category'); }
    async deleteTicketCategory(id: number) { await this.ticketCatRepo.delete(id); return new GlobalResponse(true, 200, 'Ticket Category deleted'); }
}
