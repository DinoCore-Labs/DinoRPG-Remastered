import { ClanHistoryType } from '../enums/ClanHistoryType.js';

export interface ClanHistory {
	id: number;
	clanId: number;
	date: Date;
	type: ClanHistoryType;
	authorId: string | null;
	authorMessage: string;
	author: any;
}
