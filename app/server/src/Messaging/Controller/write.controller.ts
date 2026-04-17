import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';
import {
	assertValidMessageContent,
	ConversationTypeValue,
	ensureThreadParticipant,
	findExistingDirectConversation,
	normalizeThreadTitle
} from '../../utils/messaging/messaging.helper.js';
import { assertMessagingAccess } from './messaging.access.js';
import { getThread, getThreadBasicById } from './read.controller.js';

export async function createThread(
	userId: string,
	input: {
		participantIds: string[];
		title?: string;
		message: string;
	}
) {
	await assertMessagingAccess(userId);

	const message = assertValidMessageContent(input.message);
	const participantIds = [...new Set(input.participantIds)].filter(participantId => participantId !== userId);

	if (participantIds.length === 0) {
		throw new ExpectedError('At least one participant is required');
	}

	if (participantIds.length > 9) {
		throw new ExpectedError('Too many participants');
	}

	const [author, participants] = await Promise.all([
		prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				id: true,
				name: true
			}
		}),
		prisma.user.findMany({
			where: {
				id: {
					in: participantIds
				}
			},
			select: {
				id: true,
				name: true
			}
		})
	]);

	if (!author) {
		throw new ExpectedError('User not found');
	}

	if (participants.length !== participantIds.length) {
		throw new ExpectedError('One or more participants were not found');
	}

	const isDirect = participantIds.length === 1;

	if (isDirect) {
		const existingConversation = await findExistingDirectConversation(userId, participantIds[0]!);

		if (existingConversation) {
			await answerThread(existingConversation.id, userId, { message });
			return getThreadBasicById(existingConversation.id, userId);
		}
	}

	const now = new Date();
	const type: ConversationTypeValue = isDirect ? 'DIRECT' : 'GROUP';
	const title = isDirect ? null : normalizeThreadTitle(input.title);

	const createdConversation = await prisma.conversation.create({
		data: {
			type,
			title,
			createdById: userId,
			participants: {
				create: [
					{
						userId: author.id,
						userNameSnapshot: author.name,
						lastReadAt: now
					},
					...participants.map(participant => ({
						userId: participant.id,
						userNameSnapshot: participant.name
					}))
				]
			},
			messages: {
				create: {
					content: message,
					senderId: userId,
					senderNameSnapshot: author.name
				}
			}
		},
		select: {
			id: true
		}
	});

	return getThreadBasicById(createdConversation.id, userId);
}

export async function answerThread(
	threadId: string,
	userId: string,
	input: {
		message: string;
	}
) {
	await assertMessagingAccess(userId);
	await ensureThreadParticipant(threadId, userId);

	const message = assertValidMessageContent(input.message);

	const [author, conversation] = await Promise.all([
		prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				id: true,
				name: true
			}
		}),
		prisma.conversation.findUnique({
			where: {
				id: threadId
			},
			select: {
				id: true,
				type: true
			}
		})
	]);

	if (!author) {
		throw new ExpectedError('User not found');
	}

	if (!conversation) {
		throw new ExpectedError('Conversation not found');
	}

	if (conversation.type === 'SYSTEM') {
		throw new ExpectedError('Cannot answer a system conversation');
	}

	const now = new Date();

	await prisma.$transaction(async tx => {
		await tx.message.create({
			data: {
				conversationId: threadId,
				content: message,
				senderId: userId,
				senderNameSnapshot: author.name
			}
		});

		await tx.conversation.update({
			where: {
				id: threadId
			},
			data: {
				updatedAt: now
			}
		});

		await tx.participant.updateMany({
			where: {
				conversationId: threadId,
				userId,
				leftAt: null
			},
			data: {
				lastReadAt: now,
				isArchived: false
			}
		});

		await tx.participant.updateMany({
			where: {
				conversationId: threadId,
				leftAt: null,
				NOT: {
					userId
				}
			},
			data: {
				isArchived: false
			}
		});
	});

	return getThread(threadId, userId);
}
