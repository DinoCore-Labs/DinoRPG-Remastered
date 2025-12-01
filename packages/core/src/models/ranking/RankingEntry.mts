import type { UserData } from '../user/UserData.mjs';

export interface RankingEntry {
	points: number;
	average: number;
	dinozCount: number;
	user: Pick<UserData, 'id' | 'name'>;
}
