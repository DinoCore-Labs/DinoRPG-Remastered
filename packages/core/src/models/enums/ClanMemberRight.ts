/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/enums/ClanMemberRight.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-06-13 through 2026-06-29.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export enum ClanMemberRight {
	PAGE_MANAGE = 'PAGE_MANAGE',
	MEMBER_ACCEPT_AND_DENY_REQUESTS = 'MEMBER_ACCEPT_AND_DENY_REQUESTS',
	MEMBER_EXCLUDE = 'MEMBER_EXCLUDE',
	MEMBER_EDIT = 'MEMBER_EDIT',
	DISCUSSION_DELETE_MESSAGE = 'DISCUSSION_DELETE_MESSAGE',
	CLAN_EDIT_BANNER = 'CLAN_EDIT_BANNER',
	CLAN_EDIT_LANG = 'CLAN_EDIT_LANG',
	CLAN_EDIT_NAME = 'CLAN_EDIT_NAME'
}
