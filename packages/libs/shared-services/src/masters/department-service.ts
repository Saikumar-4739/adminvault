import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateDepartmentModel, CreateDepartmentResponseModel, GetAllDepartmentsResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateDepartmentModel, UpdateDepartmentResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class DepartmentService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllDepartments(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllDepartmentsResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllDepartments'), reqObj, config);
    }

    async createDepartment(data: CreateDepartmentModel, config?: AxiosRequestConfig): Promise<CreateDepartmentResponseModel> {
        return await this.axiosPostCall(this.getURL('departments'), data, config);
    }

    async updateDepartment(data: UpdateDepartmentModel, config?: AxiosRequestConfig): Promise<UpdateDepartmentResponseModel> {
        return await this.axiosPostCall(this.getURL('updateDepartment'), data, config);
    }

    async deleteDepartment(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteDepartment'), reqObj, config);
    }
}
