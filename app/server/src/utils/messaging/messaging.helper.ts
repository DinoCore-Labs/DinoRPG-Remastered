import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';

export type ConversationTypeValue = 'DIRECT' | 'GROUP' | 'SYSTEM';

export function normalizeMessageContent(content: string): string {
	return content.trim();
}

export function assertValidMessageContent(content: string): string {
	const normalized = normalizeMessageContent(content);

	if (!normalized) {
		throw new ExpectedError('Message cannot be empty');
	}

	if (normalized.length > 5000) {
		throw new ExpectedError('Message is too long');
	}

	return normalized;
}

export function normalizeThreadTitle(title?: string | null): string | null {
	if (!title) return null;

	const normalized = title.trim();

	if (!normalized) return null;

	if (normalized.length > 120) {
		throw new ExpectedError('Thread title is too long');
	}

	return normalized;
}

export async function ensureThreadParticipant(threadId: string, userId: string) {
	const participant = await prisma.participant.findFirst({
		where: {
			conversationId: threadId,
			userId,
			leftAt: null
		},
		select: {
			id: true
		}
	});

	if (!participant) {
		throw new ExpectedError('Conversation not found');
	}
}

export async function findExistingDirectConversation(userId: string, otherUserId: string) {
	const directConversations = await prisma.conversation.findMany({
		where: {
			type: 'DIRECT',
			participants: {
				some: {
					userId,
					leftAt: null
				}
			},
			AND: [
				{
					participants: {
						some: {
							userId: otherUserId,
							leftAt: null
						}
					}
				}
			]
		},
		select: {
			id: true,
			participants: {
				where: {
					leftAt: null
				},
				select: {
					userId: true
				}
			}
		}
	});

	return (
		directConversations.find(conversation => {
			const participantIds = conversation.participants.map(participant => participant.userId).filter(Boolean);
			return participantIds.length === 2 && participantIds.includes(userId) && participantIds.includes(otherUserId);
		}) ?? null
	);
}
