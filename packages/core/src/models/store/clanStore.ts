import { ClanLite } from '../clan/clan.js';

export interface ClanStore {
	clan?: ClanLite;
	myClan?: ClanLite;
	clanEvent?: { id: string; endDate: Date };
}
