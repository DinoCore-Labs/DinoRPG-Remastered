import axios, { type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { useLoadingStore } from '../store/loadingStore';

declare module 'axios' {
	export interface AxiosRequestConfig {
		silent?: boolean;
	}
}

const API_SERVER = String(import.meta.env.VITE_API_URL ?? '');
export const API_BASE = `${API_SERVER.replace(/\/$/, '')}/api`;

const apiClient: AxiosInstance = axios.create({
	baseURL: API_BASE,
	withCredentials: true,
	timeout: 15000,
	headers: {
		Accept: 'application/json'
	}
});

function startLoader(config: InternalAxiosRequestConfig): void {
	if (config.silent) return;
	const loadingStore = useLoadingStore();
	loadingStore.setLoaderOn();
}

function stopLoader(config?: InternalAxiosRequestConfig): void {
	if (config?.silent) return;
	const loadingStore = useLoadingStore();
	loadingStore.setLoaderOff();
}

apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		startLoader(config);
		if (!(config.data instanceof FormData)) {
			config.headers['Content-Type'] = 'application/json';
		}
		return config;
	},
	(error: AxiosError): Promise<never> => {
		stopLoader(error.config as InternalAxiosRequestConfig | undefined);
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response: AxiosResponse): AxiosResponse => {
		stopLoader(response.config);
		return response;
	},
	(error: AxiosError): Promise<never> => {
		stopLoader(error.config as InternalAxiosRequestConfig | undefined);
		return Promise.reject(error);
	}
);

export function http(): AxiosInstance {
	return apiClient;
}
