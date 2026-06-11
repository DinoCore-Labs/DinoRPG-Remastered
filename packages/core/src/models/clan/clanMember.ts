import type { UserToolTip } from '../user/userToolTip.js';

export interface ClanMember {
	id: number;
	clanId: number;
	dateJoin: Date;
	nickname: string | null;
	rights: string[];
	donation: number;
	userId: string;

	clan?: any;
	user?: any;
}

export type ClanMemberLite = Pick<ClanMember, 'id' | 'nickname' | 'rights'>;

export type UpdateClanMemberRequestBody = {
	clanMember: ClanMemberLite;
};

export type GetClanMemberResponse = (ClanMemberLite & { user: UserToolTip }) | null;
