import type { AdminDinozDetails, UpdateAdminDinozBody } from '@dinorpg/core/models/admin/adminDinoz.js';

import { http } from '../utils/http';

export const AdminDinozService = {
	getAdminDinoz(playerId: string, dinozId: number): Promise<AdminDinozDetails> {
		return http()
			.get(`/admin/dinoz/${dinozId}`, {
				params: { playerId }
			})
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},

	updateAdminDinoz(dinozId: number, body: UpdateAdminDinozBody): Promise<AdminDinozDetails> {
		return http()
			.patch(`/admin/dinoz/${dinozId}`, body)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	}
};
