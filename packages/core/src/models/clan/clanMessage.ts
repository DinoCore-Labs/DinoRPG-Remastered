/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/clan/clanMessage.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-06-13 through 2026-06-29.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
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
