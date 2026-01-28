import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateBrandModel, CreateBrandResponseModel, GetAllBrandsResponseModel, IdRequestModel, UpdateBrandModel, UpdateBrandResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class BrandService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/brands/' + childUrl;
    }

    async getAllBrands(config?: AxiosRequestConfig): Promise<GetAllBrandsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllBrands'), {}, config);
    }

    async createBrand(reqModel: CreateBrandModel, config?: AxiosRequestConfig): Promise<CreateBrandResponseModel> {
        return await this.axiosPostCall(this.getURL('createBrand'), reqModel, config);
    }

    async updateBrand(reqModel: UpdateBrandModel, config?: AxiosRequestConfig): Promise<UpdateBrandResponseModel> {
        return await this.axiosPostCall(this.getURL('updateBrand'), reqModel, config);
    }

    async deleteBrand(reqModel: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteBrand'), reqModel, config);
    }
}
