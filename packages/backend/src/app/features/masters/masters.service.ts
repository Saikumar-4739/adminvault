import { Injectable } from '@nestjs/common';
import { DataSource, EntityTarget, Repository, ObjectLiteral } from 'typeorm';
import { DepartmentRepository } from './repositories/department.repository';
import { AssetTypeRepository } from './repositories/asset-type.repository';
import { BrandRepository } from './repositories/brand.repository';
import { VendorRepository } from './repositories/vendor.repository';
import { LocationRepository } from './repositories/location.repository';
import { TicketCategoryRepository } from './repositories/ticket-category.repository';
import { CompanyInfoRepository } from './repositories/company-info.repository';
import { PasswordVaultRepository } from './repositories/password-vault.repository';
import { SlackUsersRepository } from './repositories/slack-user.repository';
import { GlobalResponse, ErrorResponse } from '@adminvault/backend-utils';
import { CreateDepartmentModel, CreateVendorModel, CreateLocationModel, CreateTicketCategoryModel, CreateAssetTypeModel, CreateBrandModel, CreateApplicationModel, CreateExpenseCategoryModel, CreatePasswordVaultModel, CreateSlackUserModel, UpdateDepartmentModel, UpdateAssetTypeModel, UpdateBrandModel, UpdateVendorModel, UpdateLocationModel, UpdateTicketCategoryModel, UpdateApplicationModel, UpdateExpenseCategoryModel, UpdatePasswordVaultModel, UpdateSlackUserModel, GetAllDepartmentsResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllVendorsResponseModel, GetAllLocationsResponseModel, GetAllTicketCategoriesResponseModel, GetAllApplicationsResponseModel, GetAllExpenseCategoriesResponseModel, GetAllPasswordVaultsResponseModel, GetAllSlackUsersResponseModel, CreateDepartmentResponseModel, CreateAssetTypeResponseModel, CreateBrandResponseModel, CreateVendorResponseModel, CreateLocationResponseModel, CreateTicketCategoryResponseModel, CreateApplicationResponseModel, CreateExpenseCategoryResponseModel, CreatePasswordVaultResponseModel, CreateSlackUserResponseModel, UpdateDepartmentResponseModel, UpdateAssetTypeResponseModel, UpdateBrandResponseModel, UpdateVendorResponseModel, UpdateLocationResponseModel, UpdateTicketCategoryResponseModel, UpdateApplicationResponseModel, UpdateExpenseCategoryResponseModel, UpdatePasswordVaultResponseModel, UpdateSlackUserResponseModel, IdRequestModel, CompanyIdRequestModel } from '@adminvault/shared-models';
import { DepartmentsMasterEntity } from './entities/department.entity';
import { AssetTypeMasterEntity } from './entities/asset-type.entity';
import { BrandsMasterEntity } from './entities/brand.entity';
import { VendorsMasterEntity } from './entities/vendor.entity';
import { LocationsMasterEntity } from './entities/location.entity';
import { TicketCategoriesMasterEntity } from './entities/ticket-category.entity';
import { ApplicationsMasterEntity } from './entities/application.entity';
import { ExpenseCategoriesMasterEntity } from './entities/expense-category.entity';
import { PasswordVaultMasterEntity } from './entities/password-vault.entity';
import { SlackUsersMasterEntity } from './entities/slack-user.entity';
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
        private passwordVaultRepo: PasswordVaultRepository,
        private slackUserRepo: SlackUsersRepository
    ) { }

    // Departments
    async getAllDepartments(): Promise<GetAllDepartmentsResponseModel> {
        try {
            const departments = await this.deptRepo.find();
            const departmentsWithCompanyName = departments.map(dept => ({
                id: dept.id,
                userId: dept.userId,

                createdAt: dept.createdAt,
                updatedAt: dept.updatedAt,
                name: dept.name,
                description: dept.description,
                isActive: dept.isActive,
                code: dept.code,
            }));
            return new GetAllDepartmentsResponseModel(true, 200, 'Departments retrieved successfully', departmentsWithCompanyName);
        } catch (error) {
            console.error('Error fetching departments:', error);
            throw new ErrorResponse(500, 'Failed to fetch Departments');
        }
    }

    async createDepartment(data: CreateDepartmentModel, userId?: number, ipAddress?: string): Promise<CreateDepartmentResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentsMasterEntity);
            // Ensure ID is not passed to let DB auto-increment
            const { id, companyId, ...createData } = data;
            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();


            return new CreateDepartmentResponseModel(true, 201, 'Department created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Department');
        }
    }

    async updateDepartment(data: UpdateDepartmentModel, userId?: number, ipAddress?: string): Promise<UpdateDepartmentResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.deptRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Department not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentsMasterEntity);
            await repo.save({ id: data.id,
                name: data.name,
                description: data.description,
                code: data.code,
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

    async deleteDepartment(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.deptRepo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const repo = transManager.getRepository(DepartmentsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Department deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Department');
        }
    }

    // Asset Types
    async getAllAssetTypes(reqModel: CompanyIdRequestModel): Promise<GetAllAssetTypesResponseModel> {
        try {
            const assetTypes = await this.assetTypeRepo.find();
            // Fetch company information from company repository
            const company = await this.companyRepo.findOne({ where: { id: reqModel.id } });
            // Map company name to each asset type
            const assetTypesWithCompanyName = assetTypes.map(asset => ({
                id: asset.id,
                userId: asset.userId,

                createdAt: asset.createdAt,
                updatedAt: asset.updatedAt,
                name: asset.name,
                description: asset.description,
                isActive: asset.isActive,
                code: asset.code,
                companyName: company?.companyName
            }));
            return new GetAllAssetTypesResponseModel(true, 200, 'Asset Types retrieved successfully', assetTypesWithCompanyName);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Asset Types');
        }
    }

    async createAssetType(data: CreateAssetTypeModel, userId?: number, ipAddress?: string): Promise<CreateAssetTypeResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();


            return new CreateAssetTypeResponseModel(true, 201, 'Asset Type created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Asset Type');
        }
    }

    async updateAssetType(data: UpdateAssetTypeModel, userId?: number, ipAddress?: string): Promise<UpdateAssetTypeResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.assetTypeRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Asset Type not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeMasterEntity);
            await repo.save({ id: data.id,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                code: data.code,
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

    async deleteAssetType(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.assetTypeRepo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const repo = transManager.getRepository(AssetTypeMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Asset Type deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Asset Type');
        }
    }

    // Brands
    async getAllBrands(reqModel: CompanyIdRequestModel): Promise<GetAllBrandsResponseModel> {
        try {
            const brands = await this.brandRepo.find();
            // Fetch company information from company repository
            const company = await this.companyRepo.findOne({ where: { id: reqModel.id } });
            // Map company name to each brand
            const brandsWithCompanyName = brands.map(brand => ({
                id: brand.id,
                userId: brand.userId,

                createdAt: brand.createdAt,
                updatedAt: brand.updatedAt,
                name: brand.name,
                description: brand.description,
                isActive: brand.isActive,
                website: brand.website,
                rating: brand.rating,
                code: brand.code,
                companyName: company?.companyName
            }));
            return new GetAllBrandsResponseModel(true, 200, 'Brands retrieved successfully', brandsWithCompanyName);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Brands');
        }
    }

    async createBrand(data: CreateBrandModel, userId?: number, ipAddress?: string): Promise<CreateBrandResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandsMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();


            return new CreateBrandResponseModel(true, 201, 'Brand created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Brand');
        }
    }

    async updateBrand(data: UpdateBrandModel, userId?: number, ipAddress?: string): Promise<UpdateBrandResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.brandRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Brand not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandsMasterEntity);
            await repo.save({ id: data.id,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                website: data.website,
                rating: data.rating,
                code: data.code,
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated brand');
            }
            await transManager.completeTransaction();


            return new UpdateBrandResponseModel(true, 200, 'Brand updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Brand');
        }
    }

    async deleteBrand(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.brandRepo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const repo = transManager.getRepository(BrandsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Brand deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Brand');
        }
    }

    // Vendors
    async getAllVendors(reqModel: CompanyIdRequestModel): Promise<GetAllVendorsResponseModel> {
        try {
            const vendors = await this.vendorRepo.find();
            // Fetch company information from company repository
            const company = await this.companyRepo.findOne({ where: { id: reqModel.id } });
            // Map company name to each vendor
            const vendorsWithCompanyName = vendors.map(vendor => ({
                id: vendor.id,
                userId: vendor.userId,

                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,
                name: vendor.name,
                description: vendor.description,
                isActive: vendor.isActive,
                contactPerson: vendor.contactPerson,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address,
                code: vendor.code,
                companyName: company?.companyName
            }));
            return new GetAllVendorsResponseModel(true, 200, 'Vendors retrieved successfully', vendorsWithCompanyName);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Vendors');
        }
    }

    async createVendor(data: CreateVendorModel, userId?: number, ipAddress?: string): Promise<CreateVendorResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorsMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();


            return new CreateVendorResponseModel(true, 201, 'Vendor created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Vendor');
        }
    }

    async updateVendor(data: UpdateVendorModel, userId?: number, ipAddress?: string): Promise<UpdateVendorResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.vendorRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Vendor not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorsMasterEntity);
            await repo.save({ id: data.id,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                contactPerson: data.contactPerson,
                email: data.email,
                phone: data.phone,
                address: data.address,
                code: data.code,
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated vendor');
            }
            await transManager.completeTransaction();


            return new UpdateVendorResponseModel(true, 200, 'Vendor updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Vendor');
        }
    }

    async deleteVendor(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.vendorRepo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const repo = transManager.getRepository(VendorsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Vendor deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Vendor');
        }
    }

    // Locations
    async getAllLocations(reqModel: CompanyIdRequestModel): Promise<GetAllLocationsResponseModel> {
        try {
            const locations = await this.locationRepo.find();
            return new GetAllLocationsResponseModel(true, 200, 'Locations retrieved successfully', locations);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Locations');
        }
    }

    async createLocation(data: CreateLocationModel, userId?: number, ipAddress?: string): Promise<CreateLocationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationsMasterEntity);
            const newItem = repo.create({
                userId: data.userId,

                name: data.name,
                description: data.description,
                isActive: data.isActive,
                address: data.address,
                city: data.city,
                country: data.country
            });
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();

            return new CreateLocationResponseModel(true, 201, 'Location created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Location');
        }
    }

    async updateLocation(data: UpdateLocationModel, userId?: number, ipAddress?: string): Promise<UpdateLocationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.locationRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Location not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationsMasterEntity);
            await repo.save({ id: data.id,
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                address: data.address,
                city: data.city,
                country: data.country
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated location');
            }
            await transManager.completeTransaction();

            return new UpdateLocationResponseModel(true, 200, 'Location updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Location');
        }
    }

    async deleteLocation(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.locationRepo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const repo = transManager.getRepository(LocationsMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Location deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Location');
        }
    }

    // Applications
    async getAllApplications(reqModel: CompanyIdRequestModel): Promise<GetAllApplicationsResponseModel> {
        try {
            const applications = await this.dataSource.getRepository(ApplicationsMasterEntity).find();
            return new GetAllApplicationsResponseModel(true, 200, 'Applications retrieved successfully', applications);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Applications');
        }
    }

    async createApplication(data: CreateApplicationModel, userId?: number, ipAddress?: string): Promise<CreateApplicationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(ApplicationsMasterEntity);

            // Format date to YYYY-MM-DD for MySQL DATE type
            const formattedDate = data.appReleaseDate
                ? new Date(data.appReleaseDate).toISOString().split('T')[0]
                : null;

            const newApp = repo.create({
                userId: data.userId,

                name: data.name,
                description: data.description,
                isActive: data.isActive,
                ownerName: data.ownerName,
                appReleaseDate: formattedDate as any
            });
            const saved = await repo.save(newApp);
            await transManager.completeTransaction();


            return new CreateApplicationResponseModel(true, 201, 'Application created successfully', saved);
        } catch (error) {
            await transManager.releaseTransaction();
            console.error('Error creating application:', error);
            throw new ErrorResponse(500, 'Failed to create Application');
        }
    }

    async updateApplication(data: UpdateApplicationModel, userId?: number, ipAddress?: string): Promise<UpdateApplicationResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const repo = this.dataSource.getRepository(ApplicationsMasterEntity);
            const existing = await repo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Application not found');
            }

            await transManager.startTransaction();
            const transRepo = transManager.getRepository(ApplicationsMasterEntity);

            // Format date to YYYY-MM-DD for MySQL DATE type
            const formattedDate = data.appReleaseDate
                ? new Date(data.appReleaseDate).toISOString().split('T')[0]
                : null;

            await transRepo.update(data.id, {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                ownerName: data.ownerName,
                appReleaseDate: formattedDate as any
            });
            const updated = await transRepo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated application');
            }
            await transManager.completeTransaction();


            return new UpdateApplicationResponseModel(true, 200, 'Application updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Application');
        }
    }

    async deleteApplication(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const repo = transManager.getRepository(ApplicationsMasterEntity);
            const existing = await repo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Application deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Application');
        }
    }

    // Ticket Categories
    async getAllTicketCategories(reqModel: CompanyIdRequestModel): Promise<GetAllTicketCategoriesResponseModel> {
        try {
            const ticketCategories = await this.dataSource.getRepository(TicketCategoriesMasterEntity).find();
            return new GetAllTicketCategoriesResponseModel(true, 200, 'Ticket Categories retrieved successfully', ticketCategories);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Ticket Categories');
        }
    }

    async createTicketCategory(data: CreateTicketCategoryModel, userId?: number, ipAddress?: string): Promise<CreateTicketCategoryResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(TicketCategoriesMasterEntity);
            const newCategory = repo.create({
                userId: data.userId,

                name: data.name,
                description: data.description,
                isActive: data.isActive,
                defaultPriority: data.defaultPriority
            });
            const saved = await repo.save(newCategory);
            await transManager.completeTransaction();


            return new CreateTicketCategoryResponseModel(true, 201, 'Ticket Category created successfully', saved);
        } catch (error) {
            await transManager.releaseTransaction();
            console.error('Error creating ticket category:', error);
            throw new ErrorResponse(500, 'Failed to create Ticket Category');
        }
    }

    async updateTicketCategory(data: UpdateTicketCategoryModel, userId?: number, ipAddress?: string): Promise<UpdateTicketCategoryResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const repo = this.dataSource.getRepository(TicketCategoriesMasterEntity);
            const existing = await repo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Ticket Category not found');
            }

            await transManager.startTransaction();
            const transRepo = transManager.getRepository(TicketCategoriesMasterEntity);
            await transRepo.update(data.id, {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                defaultPriority: data.defaultPriority
            });
            const updated = await transRepo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated ticket category');
            }
            await transManager.completeTransaction();


            return new UpdateTicketCategoryResponseModel(true, 200, 'Ticket Category updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Ticket Category');
        }
    }

    async deleteTicketCategory(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const repo = transManager.getRepository(TicketCategoriesMasterEntity);
            const existing = await repo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Ticket Category deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Ticket Category');
        }
    }

    // Expense Categories
    async getAllExpenseCategories(reqModel: CompanyIdRequestModel): Promise<GetAllExpenseCategoriesResponseModel> {
        try {
            const expenseCategories = await this.dataSource.getRepository(ExpenseCategoriesMasterEntity).find();
            return new GetAllExpenseCategoriesResponseModel(true, 200, 'Expense Categories retrieved successfully', expenseCategories as any);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Expense Categories');
        }
    }

    async createExpenseCategory(data: CreateExpenseCategoryModel, userId?: number, ipAddress?: string): Promise<CreateExpenseCategoryResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(ExpenseCategoriesMasterEntity);
            const newCategory = repo.create({
                userId: data.userId,

                name: data.name,
                description: data.description,
                isActive: data.isActive,
                categoryType: data.categoryType,
                budgetLimit: data.budgetLimit
            });
            const saved = await repo.save(newCategory);
            await transManager.completeTransaction();


            return new CreateExpenseCategoryResponseModel(true, 201, 'Expense Category created successfully', saved as any);
        } catch (error) {
            await transManager.releaseTransaction();
            console.error('Error creating expense category:', error);
            throw new ErrorResponse(500, 'Failed to create Expense Category');
        }
    }

    async updateExpenseCategory(data: UpdateExpenseCategoryModel, userId?: number, ipAddress?: string): Promise<UpdateExpenseCategoryResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const repo = this.dataSource.getRepository(ExpenseCategoriesMasterEntity);
            const existing = await repo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Expense Category not found');
            }

            await transManager.startTransaction();
            const transRepo = transManager.getRepository(ExpenseCategoriesMasterEntity);
            await transRepo.update(data.id, {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                categoryType: data.categoryType,
                budgetLimit: data.budgetLimit
            });
            const updated = await transRepo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated expense category');
            }
            await transManager.completeTransaction();


            return new UpdateExpenseCategoryResponseModel(true, 200, 'Expense Category updated successfully', updated as any);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Expense Category');
        }
    }

    async deleteExpenseCategory(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const repo = transManager.getRepository(ExpenseCategoriesMasterEntity);
            const existing = await repo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Expense Category deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Expense Category');
        }
    }

    // Password Vaults
    async getAllPasswordVaults(reqModel: CompanyIdRequestModel): Promise<GetAllPasswordVaultsResponseModel> {
        try {
            const passwordVaults = await this.passwordVaultRepo.find();
            return new GetAllPasswordVaultsResponseModel(true, 200, 'Password Vaults retrieved successfully', passwordVaults);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Password Vaults');
        }
    }

    async createPasswordVault(data: CreatePasswordVaultModel, userId?: number, ipAddress?: string): Promise<CreatePasswordVaultResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(PasswordVaultMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create(createData);
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();


            return new CreatePasswordVaultResponseModel(true, 201, 'Password Vault created successfully', savedItem);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Password Vault');
        }
    }

    async updatePasswordVault(data: UpdatePasswordVaultModel, userId?: number, ipAddress?: string): Promise<UpdatePasswordVaultResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.passwordVaultRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Password Vault not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(PasswordVaultMasterEntity);
            await repo.save({ id: data.id,
                name: data.name,
                password: data.password,
                description: data.description,
                isActive: data.isActive,
                username: data.username,
                url: data.url,
                notes: data.notes
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            if (!updated) {
                throw new ErrorResponse(500, 'Failed to retrieve updated password vault');
            }
            await transManager.completeTransaction();


            return new UpdatePasswordVaultResponseModel(true, 200, 'Password Vault updated successfully', updated);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Password Vault');
        }
    }

    async deletePasswordVault(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.passwordVaultRepo.findOne({ where: { id: reqModel.id } });

            await transManager.startTransaction();
            const repo = transManager.getRepository(PasswordVaultMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            if (existing) {
            }

            return new GlobalResponse(true, 200, 'Password Vault deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Password Vault');
        }
    }


    // Slack Users
    async getAllSlackUsers(reqModel: CompanyIdRequestModel): Promise<GetAllSlackUsersResponseModel> {
        try {
            const users = await this.slackUserRepo.find();
            return new GetAllSlackUsersResponseModel(true, 200, 'Slack Users retrieved successfully', users as any);
        } catch (error) {
            throw new ErrorResponse(500, 'Failed to fetch Slack Users');
        }
    }

    async createSlackUser(data: CreateSlackUserModel, userId?: number, ipAddress?: string): Promise<CreateSlackUserResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            await transManager.startTransaction();
            const repo = transManager.getRepository(SlackUsersMasterEntity);
            const { companyId, ...createData } = data;
            const newItem = repo.create({
                ...createData,
                isActive: true
            });
            const savedItem = await repo.save(newItem);
            await transManager.completeTransaction();
            return new CreateSlackUserResponseModel(true, 201, 'Slack User created successfully', savedItem as any);
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to create Slack User');
        }
    }

    async updateSlackUser(data: UpdateSlackUserModel, userId?: number, ipAddress?: string): Promise<UpdateSlackUserResponseModel> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.slackUserRepo.findOne({ where: { id: data.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Slack User not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(SlackUsersMasterEntity);
            await repo.save({ id: data.id,
                name: data.name,
                email: data.email,
                slackUserId: data.slackUserId,
                displayName: data.displayName,
                role: data.role,
                department: data.department,
                phone: data.phone,
                notes: data.notes,
                isActive: data.isActive,
            });
            const updated = await repo.findOne({ where: { id: data.id } });
            await transManager.completeTransaction();

            if (!updated) throw new Error('Failed to retrieve updated user');

            return new UpdateSlackUserResponseModel(true, 200, 'Slack User updated successfully', updated as any);
        } catch (error) {
            await transManager.releaseTransaction();
            throw error instanceof ErrorResponse ? error : new ErrorResponse(500, 'Failed to update Slack User');
        }
    }

    async deleteSlackUser(reqModel: IdRequestModel, userId?: number, ipAddress?: string): Promise<GlobalResponse> {
        const transManager = new GenericTransactionManager(this.dataSource);
        try {
            const existing = await this.slackUserRepo.findOne({ where: { id: reqModel.id } });
            if (!existing) {
                throw new ErrorResponse(404, 'Slack User not found');
            }

            await transManager.startTransaction();
            const repo = transManager.getRepository(SlackUsersMasterEntity);
            const delEntity = await repo.findOne({ where: { id: reqModel.id } }); if (delEntity) await repo.remove(delEntity);
            await transManager.completeTransaction();

            return new GlobalResponse(true, 200, 'Slack User deleted successfully');
        } catch (error) {
            await transManager.releaseTransaction();
            throw new ErrorResponse(500, 'Failed to delete Slack User');
        }
    }
}
