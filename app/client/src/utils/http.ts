import axios, { type AxiosInstance } from 'axios';

const API_SERVER = new URL(import.meta.env.VITE_API_URL);
export const API_BASE = `${API_SERVER}api`;

export function http(): AxiosInstance {
	return axios.create({
		baseURL: API_BASE,
		withCredentials: true,
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
