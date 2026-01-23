import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateBrandModel, CreateBrandResponseModel, GetAllBrandsResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateBrandModel, UpdateBrandResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class BrandService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllBrands(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllBrandsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllBrands'), reqObj, config);
    }

    async createBrand(data: CreateBrandModel, config?: AxiosRequestConfig): Promise<CreateBrandResponseModel> {
        return await this.axiosPostCall(this.getURL('brands'), data, config);
    }

    async updateBrand(data: UpdateBrandModel, config?: AxiosRequestConfig): Promise<UpdateBrandResponseModel> {
        return await this.axiosPostCall(this.getURL('updateBrand'), data, config);
    }

    async deleteBrand(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteBrand'), reqObj, config);
    }
}
