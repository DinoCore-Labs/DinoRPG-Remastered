import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';
import { MESSAGE_PAGE_SIZE } from '../../utils/messaging/constants.js';
import { ensureThreadParticipant } from '../../utils/messaging/messaging.helper.js';
import { mapMessage, mapThreadBasic } from '../../utils/messaging/messaging.mapper.js';
import { assertMessagingAccess } from './messaging.access.js';
import { messageSelect, threadBasicSelect, threadFullSelect } from './messaging.selects.js';

export async function getThreadMessagesPage(threadId: string, userId: string, page = 1) {
	const safePage = page > 0 ? page : 1;
	const skip = (safePage - 1) * MESSAGE_PAGE_SIZE;

	const [messages, total] = await Promise.all([
		prisma.message.findMany({
			where: {
				conversationId: threadId,
				deletedAt: null
			},
			orderBy: {
				createdAt: 'desc'
			},
			skip,
			take: MESSAGE_PAGE_SIZE,
			select: messageSelect
		}),
		prisma.message.count({
			where: {
				conversationId: threadId,
				deletedAt: null
			}
		})
	]);

	return {
		page: safePage,
		pageSize: MESSAGE_PAGE_SIZE,
		hasMore: skip + messages.length < total,
		messages: messages.reverse().map(message => mapMessage(message, userId))
	};
}

export async function getThreadBasicById(threadId: string, userId: string) {
	const conversation = await prisma.conversation.findUnique({
		where: {
			id: threadId
		},
		select: threadBasicSelect
	});

	if (!conversation) {
		throw new ExpectedError('Conversation not found');
	}

	return mapThreadBasic(conversation, userId);
}

export async function getThreads(userId: string) {
	await assertMessagingAccess(userId);

	const conversations = await prisma.conversation.findMany({
		where: {
			participants: {
				some: {
					userId,
					leftAt: null,
					isArchived: false
				}
			}
		},
		orderBy: {
			updatedAt: 'desc'
		},
		select: threadBasicSelect
	});

	return conversations.map(conversation => mapThreadBasic(conversation, userId));
}

export async function getThread(threadId: string, userId: string) {
	await assertMessagingAccess(userId);
	await ensureThreadParticipant(threadId, userId);

	await prisma.participant.updateMany({
		where: {
			conversationId: threadId,
			userId,
			leftAt: null
		},
		data: {
			lastReadAt: new Date()
		}
	});

	const [conversation, firstPage] = await Promise.all([
		prisma.conversation.findUnique({
			where: {
				id: threadId
			},
			select: threadFullSelect
		}),
		getThreadMessagesPage(threadId, userId, 1)
	]);

	if (!conversation) {
		throw new ExpectedError('Conversation not found');
	}

	return {
		...mapThreadBasic(conversation, userId),
		pinnedMessage: conversation.pinnedMessage ? mapMessage(conversation.pinnedMessage, userId) : null,
		messages: firstPage.messages
	};
}

export async function loadThreadMessages(threadId: string, userId: string, page = 1) {
	await assertMessagingAccess(userId);
	await ensureThreadParticipant(threadId, userId);

	return getThreadMessagesPage(threadId, userId, page);
}
