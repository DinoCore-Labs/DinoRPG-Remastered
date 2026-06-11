import type { ClanLite, treasureIngredient } from '@dinorpg/core/models/clan/clan.js';
import type { ClanHistory } from '@dinorpg/core/models/Clan/clanHistory.js';
import type { JoinClanResponse, JoinRequestListResponse } from '@dinorpg/core/models/clan/clanJoinRequest.js';
import type {
	ClanMember,
	GetClanMemberResponse,
	UpdateClanMemberRequestBody
} from '@dinorpg/core/models/clan/clanMember.js';
import type { ClanPage } from '@dinorpg/core/models/clan/clanPage.js';
import { Language } from '@dinorpg/core/models/config/language.js';
import type { ShopDTO } from '@dinorpg/core/models/shop/shopFiche.js';

import { api } from '../utils/http';

export const ClanService = {
	//Clan

	async createClan(name: string, description: string, languages: Language[]): Promise<ClanLite> {
		return api.post<ClanLite>(`/clan/create`, { name, description, languages });
	},
	async updateClanLangs(clanId: number, languages: Language[]): Promise<Language[]> {
		const res = await api.put<{ languages: Language[] }>(`/clan/${clanId}/edit/langs`, { languages });
		return res.languages;
	},
	async deleteClan(clanId: number): Promise<void> {
		return api.delete<void>(`/clan/${clanId}`);
	},
	async getClan(clanId: number): Promise<ClanLite> {
		return api.get<ClanLite>(`/clan/${clanId}`);
	},
	async getPlayerHasRight(clanId: number, right: string): Promise<boolean> {
		return api.get<boolean>(`/clan/${clanId}/hasRight/${right}`);
	},
	async updateClanBanner(id: number, data: FormData): Promise<void> {
		return api.put<void>(`/clan/` + id + `/edit/banner`, data);
	},

	//Clan History
	async getClanHistory(id: number, page: number): Promise<{ history: ClanHistory[]; count: number }> {
		return api.get<{ history: ClanHistory[]; count: number }>(`/clan/${id}/history/${page}`);
	},

	//Clan Member(s)
	async getClanMember(clanId: number, memberId: number): Promise<GetClanMemberResponse> {
		return api.get<GetClanMemberResponse>(`/clan/${clanId}/member/${memberId}`);
	},
	async updateClanMember(clanId: number, clanMember: UpdateClanMemberRequestBody['clanMember']): Promise<void> {
		return api.put<void>(`/clan/${clanId}/member`, { clanMember: clanMember });
	},
	async getClanMembersList(clanId: number): Promise<Array<ClanMember>> {
		return api.get<Array<ClanMember>>(`/clan/${clanId}/members`);
	},
	async getJoinRequestslist(clanId: number): Promise<JoinRequestListResponse> {
		return api.get<JoinRequestListResponse>(`/clan/${clanId}/requests`);
	},
	async acceptJoinClanRequest(requestId: number): Promise<ClanMember> {
		return api.post<ClanMember>(`/clan/request/${requestId}`);
	},
	async denyJoinClanRequest(clanId: number): Promise<void> {
		return api.delete<void>(`/clan/request/${clanId}`);
	},
	async excludeClanMember(clanId: number, memberId: number): Promise<void> {
		return api.delete<void>(`/clan/${clanId}/member/${memberId}`);
	},
	async leaveClanSelf(): Promise<void> {
		return api.delete<void>(`/clan/member/self`);
	},
	async joinClan(clanId: number): Promise<JoinClanResponse> {
		return api.post<JoinClanResponse>(`/clan/${clanId}/join`);
	},
	async getSelfJoinRequest(): Promise<JoinClanResponse> {
		return api.get<JoinClanResponse>(`/clan/joinRequest`);
	},

	//Clan pages

	async getClanPage(pageId: number): Promise<ClanPage> {
		return api.get<ClanPage>(`/clan/page/${pageId}`);
	},
	async createClanPage(name: string, content: string, isPublic: boolean, clanId: number): Promise<ClanPage> {
		return api.post<ClanPage>(`/clan/page`, { name: name, content: content, isPublic: isPublic, clanId: clanId });
	},
	async updateClanPage(
		pageId: number,
		name: string,
		content: string,
		isPublic: boolean,
		clanId: number
	): Promise<ClanPage> {
		return api.put<ClanPage>(`/clan/${clanId}/page/${pageId}`, { name: name, content: content, isPublic: isPublic });
	},
	async deleteClanPage(pageId: number, clanId: number): Promise<void> {
		return api.delete<void>(`/clan/${clanId}/page/${pageId}`);
	},
	async getClanPages(clanId: number): Promise<ClanPage[]> {
		return api.get<ClanPage[]>(`/clan/${clanId}/pages`);
	},

	//Clan Treasure
	async getClanTreasure(clanId: number): Promise<treasureIngredient[]> {
		return api.get<treasureIngredient[]>(`/clan/${clanId}/treasure`);
	},
	async giveIngredient(clanId: number, ingredients: ShopDTO[]): Promise<void> {
		return api.post<void>(`/clan/${clanId}/give`, { ingredients: ingredients });
	},

	//Clan list
	async getClansList(page: number): Promise<ClanLite[]> {
		return api.get<ClanLite[]>(`/clan/all/${page}`);
	},
	async searchClansByName(name: string, page: number): Promise<ClanLite[]> {
		return api.get<ClanLite[]>(`/clan/search/${name}/${page}`);
	}
};
