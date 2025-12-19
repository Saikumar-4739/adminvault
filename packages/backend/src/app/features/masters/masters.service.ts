import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget, Repository, ObjectLiteral } from 'typeorm';
import { DepartmentRepository } from '../../repository/masters/department.repository';
import { AssetTypeRepository } from '../../repository/masters/asset-type.repository';
import { BrandRepository } from '../../repository/masters/brand.repository';
import { VendorRepository } from '../../repository/masters/vendor.repository';
import { LocationRepository } from '../../repository/masters/location.repository';
import { TicketCategoryRepository } from '../../repository/masters/ticket-category.repository';
import { CompanyInfoRepository } from '../../repository/company-info.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateDepartmentModel, CreateVendorModel, CreateLocationModel, CreateTicketCategoryModel, CreateAssetTypeModel, CreateBrandModel, UpdateDepartmentModel, UpdateAssetTypeModel, UpdateBrandModel, UpdateVendorModel, UpdateLocationModel, UpdateTicketCategoryModel, GetAllDepartmentsResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllVendorsResponseModel, GetAllLocationsResponseModel, GetAllTicketCategoriesResponseModel, CreateDepartmentResponseModel, CreateAssetTypeResponseModel, CreateBrandResponseModel, CreateVendorResponseModel, CreateLocationResponseModel, CreateTicketCategoryResponseModel, UpdateDepartmentResponseModel, UpdateAssetTypeResponseModel, UpdateBrandResponseModel, UpdateVendorResponseModel, UpdateLocationResponseModel, UpdateTicketCategoryResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { DepartmentEntity } from '../../entities/masters/department.entity';
import { AssetTypeEntity } from '../../entities/masters/asset-type.entity';
import { BrandEntity } from '../../entities/masters/brand.entity';
import { VendorEntity } from '../../entities/masters/vendor.entity';
import { LocationEntity } from '../../entities/masters/location.entity';
import { TicketCategoryEntity } from '../../entities/masters/ticket-category.entity';
import { GenericTransactionManager } from '../../../database/typeorm-transactions';

@Injectable()
export class MastersService {
    constructor(
        private dataSource: DataSource,
        private deptRepo: DepartmentRepository,
        private assetTypeRepo: AssetTypeRepository,
        private brandRepo: BrandRepository,
        private vendorRepo: VendorRepository,
        private locationRepo: LocationRepository,
        private ticketCatRepo: TicketCategoryRepository,
        private companyRepo: CompanyInfoRepository,
    ) { }

    // Departments
    async getAllDepartments(reqModel: CompanyIdRequestModel): Promise<GetAllDepartmentsResponseModel> {
        try {
            // Fetch departments
            const departments = await this.deptRepo.find({ where: { companyId: reqModel.id } });

            // Fetch company information from company repository
            const company = await this.companyRepo.findOne({ where: { id: reqModel.id } });

            // Map company name to each department
            const departmentsWithCompanyName = departments.map(dept => ({
                id: dept.id,
                userId: dept.userId,
                companyId: dept.companyId,
                createdAt: dept.createdAt,
                updatedAt: dept.updatedAt,
                name: dept.name,
                description: dept.description,
                isActive: dept.isActive,
                status: dept.status,
                level: dept.level,
                code: dept.code,
                companyName: company?.companyName
            }));

            return new GetAllDepartmentsResponseModel(true, 200, 'Departments retrieved successfully', departmentsWithCompanyName);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Departments');
        }
    }

    async createDepartment(data: CreateDepartmentModel): Promise<CreateDepartmentResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentEntity);
            const newItem = repo.create(data);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateDepartmentResponseModel(true, 201, 'Department created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Department');
        }
    }

    async updateDepartment(data: UpdateDepartmentModel): Promise<UpdateDepartmentResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.deptRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Department not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentEntity);
            await repo.update(data.id, {
                name: data.name,
                description: data.description,
                code: data.code,
                status: data.status,
                level: data.level,
                isActive: data.isActive
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated department');
            }
            await transManager.completeTransaction();
            return new UpdateDepartmentResponseModel(true, 200, 'Department updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Department');
        }
    }

    async deleteDepartment(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Department deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Department');
        }
    }

    // Asset Types
    async getAllAssetTypes(reqModel: CompanyIdRequestModel): Promise<GetAllAssetTypesResponseModel> {
        try {
            // Fetch asset types
            const assetTypes = await this.assetTypeRepo.find({ where: { companyId: reqModel.id } });

            // Fetch company information from company repository
            const company = await this.companyRepo.findOne({ where: { id: reqModel.id } });

            // Map company name to each asset type
            const assetTypesWithCompanyName = assetTypes.map(asset => ({
                id: asset.id,
                userId: asset.userId,
                companyId: asset.companyId,
                createdAt: asset.createdAt,
                updatedAt: asset.updatedAt,
                name: asset.name,
                description: asset.description,
                isActive: asset.isActive,
                companyName: company?.companyName
            }));

            return new GetAllAssetTypesResponseModel(true, 200, 'Asset Types retrieved successfully', assetTypesWithCompanyName);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Asset Types');
        }
    }

    async createAssetType(data: CreateAssetTypeModel): Promise<CreateAssetTypeResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeEntity);
            const newItem = repo.create(data);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateAssetTypeResponseModel(true, 201, 'Asset Type created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Asset Type');
        }
    }

    async updateAssetType(data: UpdateAssetTypeModel): Promise<UpdateAssetTypeResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.assetTypeRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Asset Type not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeEntity);
            await repo.update(data.id, {
                name: data.name,
                description: data.description,
                isActive: data.isActive
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated asset type');
            }
            await transManager.completeTransaction();
            return new UpdateAssetTypeResponseModel(true, 200, 'Asset Type updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Asset Type');
        }
    }

    async deleteAssetType(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Asset Type deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Asset Type');
        }
    }

    // Brands
    async getAllBrands(reqModel: CompanyIdRequestModel): Promise<GetAllBrandsResponseModel> {
        try {
            const brands = await this.brandRepo.find({ where: { companyId: reqModel.id } });
            return new GetAllBrandsResponseModel(true, 200, 'Brands retrieved successfully', brands);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Brands');
        }
    }

    async createBrand(data: CreateBrandModel): Promise<CreateBrandResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandEntity);
            const newItem = repo.create(data);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateBrandResponseModel(true, 201, 'Brand created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Brand');
        }
    }

    async deleteBrand(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Brand deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Brand');
        }
    }

    // Vendors
    async getAllVendors(reqModel: CompanyIdRequestModel): Promise<GetAllVendorsResponseModel> {
        try {
            const vendors = await this.vendorRepo.find({ where: { companyId: reqModel.id } });
            return new GetAllVendorsResponseModel(true, 200, 'Vendors retrieved successfully', vendors);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Vendors');
        }
    }

    async createVendor(data: CreateVendorModel): Promise<CreateVendorResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorEntity);
            const newItem = repo.create(data);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateVendorResponseModel(true, 201, 'Vendor created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Vendor');
        }
    }

    async deleteVendor(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Vendor deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Vendor');
        }
    }

    // Locations
    async getAllLocations(reqModel: CompanyIdRequestModel): Promise<GetAllLocationsResponseModel> {
        try {
            const locations = await this.locationRepo.find({ where: { companyId: reqModel.id } });
            return new GetAllLocationsResponseModel(true, 200, 'Locations retrieved successfully', locations);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Locations');
        }
    }

    async createLocation(data: CreateLocationModel): Promise<CreateLocationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationEntity);
            const newItem = repo.create(data);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateLocationResponseModel(true, 201, 'Location created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Location');
        }
    }

    async deleteLocation(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Location deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Location');
        }
    }

    // Ticket Categories
    async getAllTicketCategories(reqModel: CompanyIdRequestModel): Promise<GetAllTicketCategoriesResponseModel> {
        try {
            const ticketCategories = await this.ticketCatRepo.find({ where: { companyId: reqModel.id } });
            return new GetAllTicketCategoriesResponseModel(true, 200, 'Ticket Categories retrieved successfully', ticketCategories);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Ticket Categories');
        }
    }

    async createTicketCategory(data: CreateTicketCategoryModel): Promise<CreateTicketCategoryResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(TicketCategoryEntity);
            const newItem = repo.create(data);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateTicketCategoryResponseModel(true, 201, 'Ticket Category created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Ticket Category');
        }
    }

    async deleteTicketCategory(reqModel: IdRequestModel): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(TicketCategoryEntity);
            await repo.delete(reqModel.id);
            await transManager.completeTransaction();
            return new GlobalResponse(true, 200, 'Ticket Category deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Ticket Category');
        }
    }
}
