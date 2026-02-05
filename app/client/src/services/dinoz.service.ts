import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';

import { http } from '../utils/http';

export const DinozService = {
	async setDinozName(id: number, newName: string): Promise<void> {
		return http()
			.put(`/dinoz/setname/${id}`, { newName: newName })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async getDinozFiche(id: number): Promise<DinozFiche> {
		return http()
			.get(`/dinoz/fiche/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async setSkillState(id: number, skillId: number, skillState: boolean): Promise<boolean> {
		return http()
			.put(`/dinoz/setskillstate/${id}`, {
				skillId,
				skillState
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
