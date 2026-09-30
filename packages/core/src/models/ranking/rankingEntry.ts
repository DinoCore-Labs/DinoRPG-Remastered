import { Clan } from '../clan/clan.js';
import type { UserData } from '../user/userData.js';

export interface RankingEntry {
	points: number;
	average: number;
	completion: number;
	dinozCount: number;
	user: Pick<UserData, 'id' | 'name'> & { isBot: boolean };
}

export type RankingPositionResponse = {
	position: number | null;
	points: number | null;
	dinozCount: number | null;
};

export interface ClanRankingEntry {
	totalPoints: number;
	clan: Pick<Clan, 'id' | 'name' | 'languages' | 'treasureValue'>;
}

export interface DojoRankingEntry {
	user: Pick<UserData, 'id' | 'name'> & { worth: number };
	dojo: number;
}

export interface EventPlayerRankingEntry {
	position: number;
	user: Pick<UserData, 'id' | 'name'>;
	clanName?: string;
	clanId?: number;
	languages?: string[];
	totalKills: number;
	dailyKills: number;
	averageKills: string;
}

export interface EventClanRankingEntry {
	position: number;
	clanName: string;
	clanId: number;
	languages: string[];
	totalKills: number;
	averageKills: string;
}

export interface EventRankingResponse<T> {
	eventId: string;
	edition: number;
	total: number;
	page: number;
	pageSize: number;
	ranking: T[];
}

export interface MonsterHuntRankingEntry {
	position: number;
	user: Pick<UserData, 'id' | 'name'>;
	points: number;
	objects: number;
	loot: MonsterHuntRankingLootEntry[];
}

export interface MonsterHuntRankingEdition {
	id: string;
	name: string;
	slug: string;
	status: string;
	startAt: string;
	endAt: string;
	participantCount: number;
}

export interface MonsterHuntRankingResponse {
	hunt: MonsterHuntRankingEdition;
	total: number;
	page: number;
	pageSize: number;
	ranking: MonsterHuntRankingEntry[];
}

export interface MonsterHuntRankingLootEntry {
	lootKey: string;
	nameKey: string;
	icon: string | null;
	points: number;
	count: number;
	pointsEarned: number;
}
