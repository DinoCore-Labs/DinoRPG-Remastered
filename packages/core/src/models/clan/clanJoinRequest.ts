import { UserData } from '../user/userData.js';
import { UserToolTip } from '../user/userToolTip.js';
import { Clan } from './clan.js';
import { ClanMember } from './clanMember.js';

export interface ClanJoinRequest {
	id: number;
	clanId: number;
	date: Date;
	userId: string;

	clan?: Clan;
	user?: UserData;
}

export type JoinClanResponse = Pick<ClanJoinRequest, 'id' | 'date'> & {
	clan: Pick<Clan, 'id' | 'name' | 'leaderId'> & {
		members: Pick<ClanMember, 'userId' | 'rights'>[];
	};
	user: UserToolTip;
};

export type JoinRequestListResponse = (Pick<ClanJoinRequest, 'id' | 'date'> & {
	user: UserToolTip;
})[];
