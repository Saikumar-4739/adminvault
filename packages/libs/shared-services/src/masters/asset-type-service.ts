import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateAssetTypeModel, CreateAssetTypeResponseModel, GetAllAssetTypesResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateAssetTypeModel, UpdateAssetTypeResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class AssetTypeService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllAssetTypes(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllAssetTypesResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllAssetTypes'), reqObj, config);
    }

    async createAssetType(data: CreateAssetTypeModel, config?: AxiosRequestConfig): Promise<CreateAssetTypeResponseModel> {
        return await this.axiosPostCall(this.getURL('asset-types'), data, config);
    }

    async updateAssetType(data: UpdateAssetTypeModel, config?: AxiosRequestConfig): Promise<UpdateAssetTypeResponseModel> {
        return await this.axiosPostCall(this.getURL('updateAssetType'), data, config);
    }

    async deleteAssetType(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteAssetType'), reqObj, config);
    }
}
