import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import {
    CreateEmployeeModel,
    UpdateEmployeeModel,
    DeleteEmployeeModel,
    GetEmployeeModel,
    GetEmployeeResponseModel,
    GetAllEmployeesResponseModel,
    GlobalResponse,
    CreateSlackUserModel,
    UpdateSlackUserModel,
    GetAllSlackUsersResponseModel,
    IdRequestModel
} from '@adminvault/shared-models';

export class EmployeesService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/employees/' + childUrl;
    }

    private getMastersURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async createEmployee(reqObj: CreateEmployeeModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createEmployee'), reqObj, config);
    }

    async updateEmployee(reqObj: UpdateEmployeeModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateEmployee'), reqObj, config);
    }

    async getEmployee(reqObj: GetEmployeeModel, config?: AxiosRequestConfig): Promise<GetEmployeeResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getEmployee'), reqObj, config);
    }

    async getAllEmployees(companyId: number, config?: AxiosRequestConfig): Promise<GetAllEmployeesResponseModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getAllEmployees'), { companyId }, config);
    }

    async deleteEmployee(reqObj: DeleteEmployeeModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteEmployee'), reqObj, config);
    }

    async bulkImport(file: File, companyId: number, userId: number, config?: AxiosRequestConfig): Promise<import('@adminvault/shared-models').BulkImportResponseModel> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', String(companyId));
        formData.append('userId', String(userId));

        return await this.axiosPostCall(this.getURLwithMainEndPoint('bulk-import'), formData, {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async createSlackUser(reqObj: CreateSlackUserModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getMastersURL('createSlackUser'), reqObj, config);
    }

    async updateSlackUser(reqObj: UpdateSlackUserModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getMastersURL('updateSlackUser'), reqObj, config);
    }

    async deleteSlackUser(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getMastersURL('deleteSlackUser'), reqObj, config);
    }

    async getAllSlackUsers(companyId: number, config?: AxiosRequestConfig): Promise<GetAllSlackUsersResponseModel> {
        return await this.axiosPostCall(this.getMastersURL('getAllSlackUsers'), { companyId }, config);
    }
}
