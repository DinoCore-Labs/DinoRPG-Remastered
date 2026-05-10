import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig
} from 'axios';

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
	if (config.silent) {
		return;
	}
	const loadingStore = useLoadingStore();
	loadingStore.setLoaderOn();
}

function stopLoader(config?: InternalAxiosRequestConfig): void {
	if (config?.silent) {
		return;
	}
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

async function unwrapData<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
	const response = await request;
	return response.data;
}

export const api = {
	get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return unwrapData(apiClient.get<T>(url, config));
	},
	post<T, Body = unknown>(url: string, body?: Body, config?: AxiosRequestConfig): Promise<T> {
		return unwrapData(apiClient.post<T>(url, body, config));
	},
	put<T, Body = unknown>(url: string, body?: Body, config?: AxiosRequestConfig): Promise<T> {
		return unwrapData(apiClient.put<T>(url, body, config));
	},
	patch<T, Body = unknown>(url: string, body?: Body, config?: AxiosRequestConfig): Promise<T> {
		return unwrapData(apiClient.patch<T>(url, body, config));
	},
	delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return unwrapData(apiClient.delete<T>(url, config));
	}
};

export function http(): AxiosInstance {
	return apiClient;
}
