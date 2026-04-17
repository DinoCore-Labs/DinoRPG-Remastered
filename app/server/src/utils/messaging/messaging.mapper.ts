import { ConversationTypeValue } from './messaging.helper.js';

export function mapUser(user: { id: string; name: string } | null, fallbackName?: string) {
	if (user) {
		return {
			id: user.id,
			name: user.name
		};
	}

	if (!fallbackName) return null;

	return {
		id: '',
		name: fallbackName
	};
}

export function mapParticipant(participant: {
	id: number;
	joinedAt: Date;
	leftAt: Date | null;
	lastReadAt: Date | null;
	isArchived: boolean;
	isMuted: boolean;
	userId: string | null;
	userNameSnapshot: string;
	user: { id: string; name: string } | null;
}) {
	return {
		id: participant.id,
		joinedAt: participant.joinedAt.toISOString(),
		leftAt: participant.leftAt ? participant.leftAt.toISOString() : null,
		lastReadAt: participant.lastReadAt ? participant.lastReadAt.toISOString() : null,
		isArchived: participant.isArchived,
		isMuted: participant.isMuted,
		player: mapUser(participant.user, participant.userNameSnapshot),
		playerName: participant.user?.name ?? participant.userNameSnapshot,
		playerId: participant.user?.id ?? participant.userId
	};
}

export function mapMessage(
	message: {
		id: number;
		content: string;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
		senderId: string | null;
		senderNameSnapshot: string;
		sender: { id: string; name: string } | null;
	},
	currentUserId: string
) {
	return {
		id: message.id,
		content: message.content,
		createdAt: message.createdAt.toISOString(),
		updatedAt: message.updatedAt.toISOString(),
		deletedAt: message.deletedAt ? message.deletedAt.toISOString() : null,
		sender: mapUser(message.sender, message.senderNameSnapshot),
		senderName: message.sender?.name ?? message.senderNameSnapshot,
		isOwn: message.senderId === currentUserId
	};
}

export function resolveConversationTitle(
	conversation: {
		type: ConversationTypeValue;
		title: string | null;
		participants: Array<{
			userId: string | null;
			userNameSnapshot: string;
			user: { id: string; name: string } | null;
		}>;
	},
	currentUserId: string
) {
	if (conversation.title?.trim()) {
		return conversation.title;
	}

	if (conversation.type === 'SYSTEM') {
		return 'Système';
	}

	if (conversation.type === 'DIRECT') {
		const otherParticipant = conversation.participants.find(participant => participant.userId !== currentUserId);

		if (!otherParticipant) {
			return 'Conversation';
		}

		return otherParticipant.user?.name ?? otherParticipant.userNameSnapshot;
	}

	const otherNames = conversation.participants
		.filter(participant => participant.userId !== currentUserId)
		.map(participant => participant.user?.name ?? participant.userNameSnapshot);

	if (otherNames.length === 0) {
		return 'Conversation';
	}

	return otherNames.join(', ');
}

export function mapThreadBasic(
	conversation: {
		id: string;
		type: ConversationTypeValue;
		title: string | null;
		createdAt: Date;
		updatedAt: Date;
		createdBy: { id: string; name: string } | null;
		participants: Array<{
			id: number;
			joinedAt: Date;
			leftAt: Date | null;
			lastReadAt: Date | null;
			isArchived: boolean;
			isMuted: boolean;
			userId: string | null;
			userNameSnapshot: string;
			user: { id: string; name: string } | null;
		}>;
		messages: Array<{
			id: number;
			createdAt: Date;
			senderId: string | null;
		}>;
	},
	currentUserId: string
) {
	const currentParticipant = conversation.participants.find(participant => participant.userId === currentUserId);
	const lastMessage = conversation.messages[0] ?? null;

	return {
		id: conversation.id,
		type: conversation.type,
		title: resolveConversationTitle(conversation, currentUserId),
		createdAt: conversation.createdAt.toISOString(),
		updatedAt: conversation.updatedAt.toISOString(),
		createdBy: mapUser(conversation.createdBy),
		participants: conversation.participants.map(mapParticipant),
		hasUnread: Boolean(
			lastMessage &&
			lastMessage.senderId !== currentUserId &&
			(!currentParticipant?.lastReadAt || currentParticipant.lastReadAt < lastMessage.createdAt)
		),
		lastMessageAt: lastMessage ? lastMessage.createdAt.toISOString() : null
	};
}
