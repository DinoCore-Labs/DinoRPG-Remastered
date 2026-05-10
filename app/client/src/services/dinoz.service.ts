import type { DigResponse } from '@dinorpg/core/models/dinoz/digTreasure.js';
import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { UnfreezeDinozResponse } from '@dinorpg/core/models/dinoz/dinozRest.js';
import type { ManageDinozPageData } from '@dinorpg/core/models/dinoz/manageDinoz.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { ItemFeedBack } from '@dinorpg/core/models/items/itemFeedback.js';
import type { AxiosRequestConfig } from 'axios';

import { api } from '../utils/http';

export const DinozService = {
	setDinozName(id: number, newName: string): Promise<void> {
		return api.put<void>(`/dinoz/setname/${id}`, {
			name: newName
		});
	},
	getDinozFiche(id: number, config?: AxiosRequestConfig): Promise<DinozFiche> {
		return api.get<DinozFiche>(`/dinoz/fiche/${id}`, config);
	},
	setSkillState(id: number, skillId: number, skillState: boolean): Promise<boolean> {
		return api.patch<boolean>(`/dinoz/setskillstate/${id}`, {
			skillId,
			skillState
		});
	},
	useIrma(dinozId: number): Promise<ItemFeedBack> {
		return api.post<ItemFeedBack>(`/dinoz/${dinozId}/irma`);
	},
	move(dinozId: number, placeId: number): Promise<FightResult> {
		return api.put<FightResult>('/dinoz/move', {
			placeId,
			dinozId
		});
	},
	resurrectDinoz(dinozId: number): Promise<void | ItemFeedBack> {
		return api.put<void | ItemFeedBack>(`/dinoz/resurrect/${dinozId}`);
	},
	reincarnate(dinozId: number): Promise<void> {
		return api.post<void>(`/dinoz/reincarnate/${dinozId}`);
	},
	follow(dinozId: number, targetId: number): Promise<void> {
		return api.post<void>(`/dinoz/${dinozId}/follow/${targetId}`);
	},
	unfollow(dinozId: number): Promise<void> {
		return api.post<void>(`/dinoz/${dinozId}/unfollow`);
	},

	disband(dinozId: number): Promise<void> {
		return api.post<void>(`/dinoz/${dinozId}/disband`);
	},
	changeLeader(followerId: number, currentLeaderId: number): Promise<void> {
		return api.post<void>(`/dinoz/${followerId}/change/${currentLeaderId}`);
	},
	restDinoz(dinozId: number): Promise<void> {
		return api.post<void>(`/dinoz/${dinozId}/rest`);
	},
	stopRestDinoz(dinozId: number): Promise<void> {
		return api.post<void>(`/dinoz/${dinozId}/stop-rest`);
	},
	dig(dinozId: number): Promise<DigResponse> {
		return api.get<DigResponse>(`/dinoz/dig/${dinozId}`);
	},
	congel(dinozId: number): Promise<void> {
		return api.post<void>(`/dinoz/${dinozId}/freeze`);
	},
	stopCongel(dinozId: number): Promise<UnfreezeDinozResponse> {
		return api.post<UnfreezeDinozResponse>(`/dinoz/${dinozId}/unfreeze`);
	},
	getDinozToManage(): Promise<ManageDinozPageData> {
		return api.get<ManageDinozPageData>('/dinoz/manage');
	},
	updateOrders(dinozIds: number[]): Promise<ManageDinozPageData> {
		return api.patch<ManageDinozPageData>('/dinoz/orders', {
			dinozIds
		});
	}
};
