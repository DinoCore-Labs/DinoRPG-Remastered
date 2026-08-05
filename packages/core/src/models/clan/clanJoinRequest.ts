/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/clan/clanJoinRequest.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-06-13.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
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
