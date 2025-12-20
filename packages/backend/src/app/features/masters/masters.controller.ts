import { Body, Controller, Post } from '@nestjs/common';
import { MastersService } from './masters.service';
import { CreateAssetTypeModel, CreateBrandModel, CreateDepartmentModel, CreateVendorModel, UpdateDepartmentModel, UpdateAssetTypeModel, 
    GetAllDepartmentsResponseModel, GetAllAssetTypesResponseModel, GetAllBrandsResponseModel, GetAllVendorsResponseModel, 
    CreateDepartmentResponseModel, CreateAssetTypeResponseModel, CreateBrandResponseModel, CreateVendorResponseModel, 
    UpdateDepartmentResponseModel, UpdateAssetTypeResponseModel, 
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

}
