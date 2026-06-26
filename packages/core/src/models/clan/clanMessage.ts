import { Clan } from './clan.js';

export interface ClanMessageAuthor {
	id: string;
	name: string;
	avatarUrl?: string | null;
}

export interface ClanMessage {
	id: number;
	clanId: number;
	date: Date | string;
	content: string;
	authorId: string | null;
	authorName: string;
	author?: ClanMessageAuthor | null;
	clan?: Pick<Clan, 'leaderId'> | null;
}
