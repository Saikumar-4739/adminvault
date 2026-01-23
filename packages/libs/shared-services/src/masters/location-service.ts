import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateLocationModel, CreateLocationResponseModel, GetAllLocationsResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateLocationModel, UpdateLocationResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class LocationService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllLocations(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllLocationsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllLocations'), reqObj, config);
    }

    async createLocation(data: CreateLocationModel, config?: AxiosRequestConfig): Promise<CreateLocationResponseModel> {
        return await this.axiosPostCall(this.getURL('locations'), data, config);
    }

    async updateLocation(data: UpdateLocationModel, config?: AxiosRequestConfig): Promise<UpdateLocationResponseModel> {
        return await this.axiosPostCall(this.getURL('updateLocation'), data, config);
    }

    async deleteLocation(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteLocation'), reqObj, config);
    }
}
