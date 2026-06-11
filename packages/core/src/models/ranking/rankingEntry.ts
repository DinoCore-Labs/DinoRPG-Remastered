import { Clan } from '../clan/clan.js';
import type { UserData } from '../user/userData.js';

export interface RankingEntry {
	points: number;
	average: number;
	completion: number;
	dinozCount: number;
	user: Pick<UserData, 'id' | 'name'>;
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
