import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { userSession } from "./HelperService";


const updateAccessToken = () => {
    const _userSession = userSession(true);
    if (_userSession?.accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${_userSession.accessToken}`;
    }
}

export const httpGet = (endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    updateAccessToken();
    return axios.get(endpoint, config);
};

export const httpPost = (endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    updateAccessToken();
    return axios.post(endpoint, data, config);
};

export const httpPut = (endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    updateAccessToken();
    return axios.put(endpoint, data, config);
};
export const httpDelete = (endpoint: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    updateAccessToken();
    return axios.delete(endpoint, config);
};
export { }