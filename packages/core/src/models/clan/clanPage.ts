import { Clan } from './clan.js';

export interface ClanPage {
	id: number;
	home: boolean;
	public: boolean;
	name: string;
	content: string;
	clanId: number;

	Clan?: Clan;
}
