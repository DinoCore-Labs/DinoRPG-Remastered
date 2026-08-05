/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/messagerie/threadsBasic.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-04-17.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export type MessagingUser = {
	id: string;
	name: string;
};

export type ThreadParticipant = {
	id: number;
	joinedAt: string;
	leftAt: string | null;
	lastReadAt: string | null;
	isArchived: boolean;
	isMuted: boolean;
	player: MessagingUser;
	playerName: string;
	playerId: string | null;
};

export type ThreadMessage = {
	id: number;
	content: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	sender: MessagingUser;
	senderName: string;
	isOwn: boolean;
};

export type ThreadsBasic = {
	id: string;
	type: 'DIRECT' | 'GROUP' | 'SYSTEM';
	title: string;
	createdAt: string;
	updatedAt: string;
	createdBy: MessagingUser | null;
	participants: ThreadParticipant[];
	hasUnread: boolean;
	lastMessageAt: string | null;
};

export type FullThread = ThreadsBasic & {
	pinnedMessage: ThreadMessage | null;
	messages: ThreadMessage[];
};

export type PaginatedThreadMessages = {
	page: number;
	pageSize: number;
	hasMore: boolean;
	messages: ThreadMessage[];
};

export type NewThread = {
	title?: string;
	message?: string;
	participants?: MessagingUser[];
};
