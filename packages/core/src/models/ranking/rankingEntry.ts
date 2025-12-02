import type { UserData } from '../user/userData.js';

export interface RankingEntry {
	points: number;
	average: number;
	dinozCount: number;
	user: Pick<UserData, 'id' | 'name'>;
}
