import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    GlobalResponse,
    CreateDepartmentModel,
    CreateDesignationModel,
    CreateMasterModel,
    CreateVendorModel,
    CreateLocationModel,
    CreateTicketCategoryModel
} from '@adminvault/shared-models';

export class MastersService extends CommonAxiosService {
    private getUrl(type: string, id?: number) {
        return `/masters/${type}${id ? '/' + id : ''}`;
    }

    // Generic Helpers
    private async getAll(type: string, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosGetCall(this.getUrl(type), config);
    }

    private async create(type: string, data: any, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getUrl(type), data, config);
    }

    private async delete(type: string, id: number, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosDeleteCall(this.getUrl(type, id), config);
    }

    // Departments
    async getAllDepartments() { return this.getAll('departments'); }
    async createDepartment(data: CreateDepartmentModel) { return this.create('departments', data); }
    async deleteDepartment(id: number) { return this.delete('departments', id); }

    // Designations
    async getAllDesignations() { return this.getAll('designations'); }
    async createDesignation(data: CreateDesignationModel) { return this.create('designations', data); }
    async deleteDesignation(id: number) { return this.delete('designations', id); }

    // Asset Types
    async getAllAssetTypes() { return this.getAll('asset-types'); }
    async createAssetType(data: CreateMasterModel) { return this.create('asset-types', data); }
    async deleteAssetType(id: number) { return this.delete('asset-types', id); }

    // Brands
    async getAllBrands() { return this.getAll('brands'); }
    async createBrand(data: CreateMasterModel) { return this.create('brands', data); }
    async deleteBrand(id: number) { return this.delete('brands', id); }

    // Vendors
    async getAllVendors() { return this.getAll('vendors'); }
    async createVendor(data: CreateVendorModel) { return this.create('vendors', data); }
    async deleteVendor(id: number) { return this.delete('vendors', id); }

    // Locations
    async getAllLocations() { return this.getAll('locations'); }
    async createLocation(data: CreateLocationModel) { return this.create('locations', data); }
    async deleteLocation(id: number) { return this.delete('locations', id); }

    // Ticket Categories
    async getAllTicketCategories() { return this.getAll('ticket-categories'); }
    async createTicketCategory(data: CreateTicketCategoryModel) { return this.create('ticket-categories', data); }
    async deleteTicketCategory(id: number) { return this.delete('ticket-categories', id); }
}
