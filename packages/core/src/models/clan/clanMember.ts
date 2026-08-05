/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/clan/clanMember.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-06-13.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
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
