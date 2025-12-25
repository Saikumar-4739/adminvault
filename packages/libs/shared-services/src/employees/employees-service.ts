import { AxiosRequestConfig } from "axios";
import { CommonAxiosService } from "../common-axios-service";
import { CreateEmployeeModel, UpdateEmployeeModel, DeleteEmployeeModel, GetEmployeeModel, GetEmployeeByIdModel, GetAllEmployeesModel, GlobalResponse } from '@adminvault/shared-models';

export class EmployeesService extends CommonAxiosService {
    private getURLwithMainEndPoint(childUrl: string) {
        return '/employees/' + childUrl;
    }

    async createEmployee(reqObj: CreateEmployeeModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('createEmployee'), reqObj, config);
    }

    async updateEmployee(reqObj: UpdateEmployeeModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('updateEmployee'), reqObj, config);
    }

    async getEmployee(reqObj: GetEmployeeModel, config?: AxiosRequestConfig): Promise<GetEmployeeByIdModel> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('getEmployee'), reqObj, config);
    }

    async getAllEmployees(companyId?: number, config?: AxiosRequestConfig): Promise<GetAllEmployeesModel> {
        const url = companyId
            ? this.getURLwithMainEndPoint(`getAllEmployees?companyId=${companyId}`)
            : this.getURLwithMainEndPoint('getAllEmployees');
        return await this.axiosPostCall(url, {}, config);
    }

    async deleteEmployee(reqObj: DeleteEmployeeModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURLwithMainEndPoint('deleteEmployee'), reqObj, config);
    }
}
