import { api } from '../utils/http';

export interface AdminClanMember {
	id: number;
	clanId: number;
	userId: string;
	user: { id: string; name: string };
	dateJoin: string;
}

export interface AdminClanIngredient {
	id: number;
	ingredientId: number;
	quantity: number;
	clanId: number;
}

export interface AdminClanPage {
	id: number;
	name: string;
	home: boolean;
	public: boolean;
	content: string;
}

export interface AdminClanAction {
	actionKey: string;
	progress: number;
	total: number;
	completedAt: string | null;
}

export interface AdminClan {
	id: number;
	name: string;
	treasureValue: number;
	leaderId: string;
	leader: { id: string; name: string };
	members: AdminClanMember[];
	ingredients: AdminClanIngredient[];
	pages: AdminClanPage[];
	actions: AdminClanAction[];
	creationDate: string;
}

export class AdminClanService {
	static async search(query: string): Promise<{ id: number; name: string }[]> {
		return await api.get<{ id: number; name: string }[]>('/admin/clan/search', { params: { q: query } });
	}

	static async getClan(id: number): Promise<AdminClan> {
		return await api.get<AdminClan>(`/admin/clan/${id}`);
	}

	static async updateName(id: number, name: string): Promise<void> {
		await api.patch(`/admin/clan/${id}/name`, { name });
	}

	static async updateLeader(id: number, newLeaderId: string): Promise<void> {
		await api.patch(`/admin/clan/${id}/leader`, { newLeaderId });
	}

	static async kickMember(id: number, userId: string): Promise<{ deleted: boolean }> {
		return await api.delete<{ deleted: boolean }>(`/admin/clan/${id}/members/${userId}`);
	}

	static async deleteClan(id: number): Promise<void> {
		await api.delete(`/admin/clan/${id}`);
	}

	static async updateTreasure(id: number, amount: number): Promise<void> {
		await api.patch(`/admin/clan/${id}/treasure`, { amount });
	}

	static async updateIngredient(id: number, ingredientId: number, amountToAddOrRemove: number): Promise<void> {
		await api.patch(`/admin/clan/${id}/ingredients`, { ingredientId, amountToAddOrRemove });
	}

	static async updateActionProgress(id: number, actionKey: string, progress: number): Promise<AdminClanAction> {
		return await api.patch<AdminClanAction>(`/admin/clan/${id}/actions/${encodeURIComponent(actionKey)}`, { progress });
	}

	static async clearPage(id: number, pageId: number): Promise<void> {
		await api.patch(`/admin/clan/${id}/pages/${pageId}/clear`);
	}
}
