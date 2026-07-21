import { api } from '../utils/http';

export type MaintenanceStatus = {
	enabled: boolean;
};

export const MaintenanceService = {
	getStatus(): Promise<MaintenanceStatus> {
		return api.get('/maintenance', { silent: true });
	},
	update(enabled: boolean): Promise<MaintenanceStatus> {
		return api.patch('/admin/maintenance', { enabled });
	}
};
