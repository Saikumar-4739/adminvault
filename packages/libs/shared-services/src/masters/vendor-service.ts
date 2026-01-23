import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateVendorModel, CreateVendorResponseModel, GetAllVendorsResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateVendorModel, UpdateVendorResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class VendorService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllVendors(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllVendorsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllVendors'), reqObj, config);
    }

    async createVendor(data: CreateVendorModel, config?: AxiosRequestConfig): Promise<CreateVendorResponseModel> {
        return await this.axiosPostCall(this.getURL('vendors'), data, config);
    }

    async updateVendor(data: UpdateVendorModel, config?: AxiosRequestConfig): Promise<UpdateVendorResponseModel> {
        return await this.axiosPostCall(this.getURL('updateVendor'), data, config);
    }

    async deleteVendor(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteVendor'), reqObj, config);
    }
}
