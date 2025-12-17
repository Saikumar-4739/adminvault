import { AxiosRequestConfig } from 'axios';
import { AxiosInstance } from './axios-instance';
import { configVariables } from './config';

export class CommonAxiosService {
    URL = configVariables.APP_AVS_SERVICE_URL;

    private handleResponse = (response: any) => {
        if (response && (response.status >= 200 && response.status < 300)) {
            return response.data;
        } else {
            throw response;
        }
    };

    private handleError = (err: any) => {
        const errorMessage = err?.response?.data?.message || err?.message || 'An error occurred';
        throw new Error(errorMessage);
    };

    axiosPostCall = async (urlEndPoint: string, data?: any, config?: AxiosRequestConfig) => {
        console.log('POST:', this.URL + urlEndPoint);
        return await AxiosInstance.post(this.URL + urlEndPoint, data, config)
            .then(this.handleResponse)
            .catch(this.handleError);
    };

    axiosGetCall = async (urlEndPoint: string, config?: AxiosRequestConfig) => {
        console.log('GET:', this.URL + urlEndPoint);
        return await AxiosInstance.get(this.URL + urlEndPoint, config)
            .then(this.handleResponse)
            .catch(this.handleError);
    };

    axiosPutCall = async (urlEndPoint: string, data?: any, config?: AxiosRequestConfig) => {
        console.log('PUT:', this.URL + urlEndPoint);
        return await AxiosInstance.put(this.URL + urlEndPoint, data, config)
            .then(this.handleResponse)
            .catch(this.handleError);
    };

    axiosPatchCall = async (urlEndPoint: string, data?: any, config?: AxiosRequestConfig) => {
        console.log('PATCH:', this.URL + urlEndPoint);
        return await AxiosInstance.patch(this.URL + urlEndPoint, data, config)
            .then(this.handleResponse)
            .catch(this.handleError);
    };

    axiosDeleteCall = async (urlEndPoint: string, config?: AxiosRequestConfig) => {
        console.log('DELETE:', this.URL + urlEndPoint);
        return await AxiosInstance.delete(this.URL + urlEndPoint, config)
            .then(this.handleResponse)
            .catch(this.handleError);
    };
}