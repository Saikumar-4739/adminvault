import { CommonAxiosService } from '../common-axios-service';
import { AxiosRequestConfig } from 'axios';
import { CreateExpenseCategoryModel, CreateExpenseCategoryResponseModel, GetAllExpenseCategoriesResponseModel, CompanyIdRequestModel, IdRequestModel, UpdateExpenseCategoryModel, UpdateExpenseCategoryResponseModel, GlobalResponse } from '@adminvault/shared-models';

export class ExpenseCategoryService extends CommonAxiosService {
    private getURL(childUrl: string) {
        return '/masters/' + childUrl;
    }

    async getAllExpenseCategories(reqObj: CompanyIdRequestModel, config?: AxiosRequestConfig): Promise<GetAllExpenseCategoriesResponseModel> {
        return await this.axiosPostCall(this.getURL('getAllExpenseCategories'), reqObj, config);
    }

    async createExpenseCategory(data: CreateExpenseCategoryModel, config?: AxiosRequestConfig): Promise<CreateExpenseCategoryResponseModel> {
        return await this.axiosPostCall(this.getURL('expense-categories'), data, config);
    }

    async updateExpenseCategory(data: UpdateExpenseCategoryModel, config?: AxiosRequestConfig): Promise<UpdateExpenseCategoryResponseModel> {
        return await this.axiosPostCall(this.getURL('updateExpenseCategory'), data, config);
    }

    async deleteExpenseCategory(reqObj: IdRequestModel, config?: AxiosRequestConfig): Promise<GlobalResponse> {
        return await this.axiosPostCall(this.getURL('deleteExpenseCategory'), reqObj, config);
    }
}
