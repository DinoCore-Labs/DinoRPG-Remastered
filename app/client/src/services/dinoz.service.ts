import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { ItemFeedBack } from '@dinorpg/core/models/items/itemFeedback.js';

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
	},
	async useIrma(dinozId: number): Promise<ItemFeedBack> {
		return http()
			.post(`/dinoz/${dinozId}/irma`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async move(dinozId: number, placeId: number): Promise<FightResult> {
		return http()
			.put(`/dinoz/move`, {
				placeId: placeId,
				dinozId: dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async resurrectDinoz(dinozId: number): Promise<void | ItemFeedBack> {
		return http()
			.put(`/dinoz/resurrect/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async reincarnate(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/reincarnate/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async follow(dinozId: number, targetId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/follow/${targetId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async unfollow(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/unfollow`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async disband(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/disband`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async changeLeader(followerId: number, currentLeaderId: number): Promise<void> {
		return http()
			.post(`/dinoz/${followerId}/change/${currentLeaderId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async restDinoz(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/rest`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async stopRestDinoz(dinozId: number): Promise<void> {
		return http()
			.post(`/dinoz/${dinozId}/stop-rest`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
