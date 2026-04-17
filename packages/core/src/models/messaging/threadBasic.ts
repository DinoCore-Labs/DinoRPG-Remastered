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
