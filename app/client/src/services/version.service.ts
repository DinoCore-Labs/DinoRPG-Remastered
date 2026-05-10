import { api } from '../utils/http';

export interface VersionResponse {
	version?: string;
}

export const VersionService = {
	getVersion(): Promise<VersionResponse> {
		return api.get<VersionResponse>('/version', {
			silent: true,
			params: {
				t: Date.now()
			},
			headers: {
				'Cache-Control': 'no-cache'
			}
		});
	}
};
