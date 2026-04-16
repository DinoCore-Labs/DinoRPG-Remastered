export type MessagingUserSummary = {
	id: string;
	name: string;
};

export type ThreadMessage = {
	id: number;
	content: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	isOwn: boolean;
	sender: MessagingUserSummary | null;
	senderName: string;
};

export type ThreadBasic = {
	id: string;
	type: 'DIRECT' | 'GROUP' | 'SYSTEM';
	title: string;
	createdAt: string;
	updatedAt: string;
	hasUnread: boolean;
	createdBy: MessagingUserSummary | null;
	participants: MessagingUserSummary[];
	lastMessageAt: string | null;
};

export type FullThread = ThreadBasic & {
	pinnedMessage: ThreadMessage | null;
	messages: ThreadMessage[];
};

export type CreateThreadBody = {
	participantIds: string[];
	title?: string;
	message: string;
};

export type AnswerThreadBody = {
	message: string;
};

export type PaginatedMessages = {
	page: number;
	pageSize: number;
	messages: ThreadMessage[];
	hasMore: boolean;
};
