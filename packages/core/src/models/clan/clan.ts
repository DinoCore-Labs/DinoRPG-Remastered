/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/clan/clan.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-06-13.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Language } from '@dinorpg/core/models/config/language.js';

import { UserData } from '../user/userData.js';
import { ClanHistory } from './clanHistory.js';
import { ClanIngredient } from './clanIngredient.js';
import { ClanJoinRequest } from './clanJoinRequest.js';
import { ClanMember } from './clanMember.js';
import { ClanPage } from './clanPage.js';
// import { ClanMessage } from './clanMessage.js';

export interface Clan {
	id: number;
	name: string;
	treasureValue: number;
	creationDate: Date;
	banner: string | null;
	leaderId: string;
	languages: Language[];

	leader?: UserData;
	history?: ClanHistory[];
	joinRequests?: ClanJoinRequest[];
	members?: ClanMember[];
	pages?: ClanPage[];
	ingredients?: ClanIngredient[];
	// discussion?: ClanMessage[];
	users?: UserData[];
}

export type treasureIngredient = {
	ingredientId: number;
	quantity: number;
};

export type ClanLite = Pick<Clan, 'id' | 'name' | 'treasureValue' | 'creationDate' | 'leaderId' | 'languages'> & {
	members: Pick<ClanMember, 'id'>[];
	leader: Pick<UserData, 'id' | 'name'>;
	banner?: string;
	ingredients?: treasureIngredient[];
};
