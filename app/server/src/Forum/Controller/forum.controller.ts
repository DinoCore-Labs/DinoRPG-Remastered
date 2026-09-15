import {
	FORUM_MAX_MESSAGES,
	FORUM_MESSAGES_PER_PAGE,
	FORUM_TOPICS_PER_PAGE,
	type ForumCategory,
	type ForumMessageView,
	type ForumTopicSummary
} from '@dinorpg/core/models/forum/forum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Role } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import type { CreateForumMessageBody, CreateForumTopicBody, UpdateForumMessageBody } from '../Schema/forum.schema.js';

function forumError(code: string, statusCode = 400): ExpectedError {
	return new ExpectedError(code, {
		statusCode
	});
}

async function getPostingUser(userId: string) {
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			id: true,
			name: true,
			mutedUntil: true,
			muteReason: true
		}
	});
	if (!user) {
		throw forumError('forum.user.notFound', 404);
	}
	if (user.mutedUntil && user.mutedUntil > new Date()) {
		throw new ExpectedError('Account_muted_until', {
			statusCode: 403,
			params: {
				date: user.mutedUntil.toLocaleDateString('fr-FR'),
				time: user.mutedUntil.toLocaleTimeString('fr-FR'),
				reason: user.muteReason || 'Non spécifiée'
			}
		});
	}
	return user;
}

async function getFavoriteIds(userId: string | undefined, topicIds: number[]): Promise<Set<number>> {
	if (!userId || topicIds.length === 0) {
		return new Set();
	}
	const favorites = await prisma.forumFavorite.findMany({
		where: {
			userId,
			topicId: {
				in: topicIds
			}
		},
		select: {
			topicId: true
		}
	});

	return new Set(favorites.map(favorite => favorite.topicId));
}

function mapTopic(
	topic: {
		id: number;
		category: ForumCategory;
		title: string;
		isPinned: boolean;
		isClosed: boolean;
		messageCount: number;
		authorId: string | null;
		authorName: string;
		author: {
			role: Role;
		} | null;
		createdAt: Date;
		lastActivityAt: Date;
	},
	favoriteIds: Set<number>
): ForumTopicSummary {
	return {
		id: topic.id,
		category: topic.category,
		title: topic.title,
		isPinned: topic.isPinned,
		isClosed: topic.isClosed,
		messageCount: topic.messageCount,
		replyCount: Math.max(0, topic.messageCount - 1),
		authorId: topic.authorId,
		authorName: topic.authorName,
		authorRole: topic.author?.role ?? null,
		createdAt: topic.createdAt.toISOString(),
		lastActivityAt: topic.lastActivityAt.toISOString(),
		isFavorite: favoriteIds.has(topic.id)
	};
}

function mapMessage(message: {
	id: number;
	topicId: number;
	content: string;
	authorId: string | null;
	authorName: string;
	createdAt: Date;
	updatedAt: Date;
	author: {
		role: Role;
		profile: {
			avatar: Uint8Array | Buffer | null;
			avatarType: string | null;
		} | null;
	} | null;
}): ForumMessageView {
	const avatar = message.author?.profile?.avatar;
	const avatarType = message.author?.profile?.avatarType;
	return {
		id: message.id,
		topicId: message.topicId,
		content: message.content,
		authorId: message.authorId,
		authorName: message.authorName,
		authorRole: message.author?.role ?? null,
		avatarUrl: avatar ? `data:${avatarType ?? 'image/webp'};base64,${Buffer.from(avatar).toString('base64')}` : null,
		createdAt: message.createdAt.toISOString(),
		updatedAt: message.updatedAt.toISOString()
	};
}

const messageAuthorInclude = {
	author: {
		select: {
			role: true,
			profile: {
				select: {
					avatar: true,
					avatarType: true
				}
			}
		}
	}
} as const;

const topicAuthorInclude = {
	author: {
		select: {
			role: true
		}
	}
} as const;

export const forumService = {
	async listTopics(category: ForumCategory, page: number, userId?: string) {
		const skip = (page - 1) * FORUM_TOPICS_PER_PAGE;
		const [topics, total] = await Promise.all([
			prisma.forumTopic.findMany({
				where: {
					category
				},
				orderBy: [
					{
						isPinned: 'desc'
					},
					{
						lastActivityAt: 'desc'
					},
					{
						id: 'desc'
					}
				],
				skip,
				take: FORUM_TOPICS_PER_PAGE,
				include: topicAuthorInclude
			}),
			prisma.forumTopic.count({
				where: {
					category
				}
			})
		]);
		const favoriteIds = await getFavoriteIds(
			userId,
			topics.map(topic => topic.id)
		);
		return {
			topics: topics.map(topic => mapTopic(topic, favoriteIds)),
			page,
			pageCount: Math.max(1, Math.ceil(total / FORUM_TOPICS_PER_PAGE)),
			total
		};
	},
	async searchTopics(query: string, page: number, userId?: string) {
		const skip = (page - 1) * FORUM_TOPICS_PER_PAGE;
		const where = {
			OR: [
				{
					title: {
						contains: query,
						mode: 'insensitive' as const
					}
				},
				{
					authorName: {
						contains: query,
						mode: 'insensitive' as const
					}
				},
				{
					messages: {
						some: {
							OR: [
								{
									content: {
										contains: query,
										mode: 'insensitive' as const
									}
								},
								{
									authorName: {
										contains: query,
										mode: 'insensitive' as const
									}
								}
							]
						}
					}
				}
			]
		};
		const [topics, total] = await Promise.all([
			prisma.forumTopic.findMany({
				where,
				orderBy: [
					{
						isPinned: 'desc'
					},
					{
						lastActivityAt: 'desc'
					},
					{
						id: 'desc'
					}
				],
				skip,
				take: FORUM_TOPICS_PER_PAGE,
				include: topicAuthorInclude
			}),
			prisma.forumTopic.count({
				where
			})
		]);
		const favoriteIds = await getFavoriteIds(
			userId,
			topics.map(topic => topic.id)
		);
		return {
			topics: topics.map(topic => mapTopic(topic, favoriteIds)),
			page,
			pageCount: Math.max(1, Math.ceil(total / FORUM_TOPICS_PER_PAGE)),
			total
		};
	},
	async listFavorites(userId: string, page: number) {
		const skip = (page - 1) * FORUM_TOPICS_PER_PAGE;
		const where = {
			favorites: {
				some: {
					userId
				}
			}
		};
		const [topics, total] = await Promise.all([
			prisma.forumTopic.findMany({
				where,
				orderBy: [
					{
						isPinned: 'desc'
					},
					{
						lastActivityAt: 'desc'
					},
					{
						id: 'desc'
					}
				],
				skip,
				take: FORUM_TOPICS_PER_PAGE,
				include: topicAuthorInclude
			}),
			prisma.forumTopic.count({
				where
			})
		]);
		const favoriteIds = new Set(topics.map(topic => topic.id));
		return {
			topics: topics.map(topic => mapTopic(topic, favoriteIds)),
			page,
			pageCount: Math.max(1, Math.ceil(total / FORUM_TOPICS_PER_PAGE)),
			total
		};
	},
	async getTopic(topicId: number, page: number, userId?: string) {
		const topic = await prisma.forumTopic.findUnique({
			where: {
				id: topicId
			},
			include: topicAuthorInclude
		});
		if (!topic) {
			throw forumError('forum.topic.notFound', 404);
		}
		const skip = (page - 1) * FORUM_MESSAGES_PER_PAGE;
		const [messages, favoriteIds] = await Promise.all([
			prisma.forumMessage.findMany({
				where: {
					topicId
				},
				orderBy: [
					{
						createdAt: 'asc'
					},
					{
						id: 'asc'
					}
				],
				skip,
				take: FORUM_MESSAGES_PER_PAGE,
				include: messageAuthorInclude
			}),
			getFavoriteIds(userId, [topicId])
		]);
		return {
			topic: mapTopic(topic, favoriteIds),
			messages: messages.map(mapMessage),
			page,
			pageCount: Math.max(1, Math.ceil(topic.messageCount / FORUM_MESSAGES_PER_PAGE)),
			totalMessages: topic.messageCount
		};
	},
	async createTopic(category: ForumCategory, input: CreateForumTopicBody, userId: string) {
		const user = await getPostingUser(userId);
		const topic = await prisma.forumTopic.create({
			data: {
				category,
				title: input.title,
				authorId: user.id,
				authorName: user.name,
				messageCount: 1,
				messages: {
					create: {
						authorId: user.id,
						authorName: user.name,
						content: input.content
					}
				}
			},
			include: topicAuthorInclude
		});
		return mapTopic(topic, new Set());
	},
	async createMessage(topicId: number, input: CreateForumMessageBody, userId: string) {
		const user = await getPostingUser(userId);
		return prisma.$transaction(async tx => {
			const now = new Date();
			/*
			 * On incrémente uniquement si :
			 *
			 * - le topic existe ;
			 * - il n'est pas fermé ;
			 * - il contient moins de 500 messages.
			 *
			 * updateMany permet ici d'éviter
			 * que deux requêtes concurrentes
			 * dépassent la limite.
			 */
			const updated = await tx.forumTopic.updateMany({
				where: {
					id: topicId,
					isClosed: false,
					messageCount: {
						lt: FORUM_MAX_MESSAGES
					}
				},
				data: {
					messageCount: {
						increment: 1
					},
					lastActivityAt: now
				}
			});
			if (updated.count === 0) {
				const existing = await tx.forumTopic.findUnique({
					where: {
						id: topicId
					},
					select: {
						id: true,
						isClosed: true,
						messageCount: true
					}
				});
				if (!existing) {
					throw forumError('forum.topic.notFound', 404);
				}
				if (existing.messageCount >= FORUM_MAX_MESSAGES) {
					throw forumError('forum.topic.full', 409);
				}
				throw forumError('forum.topic.closed', 409);
			}
			const topic = await tx.forumTopic.findUniqueOrThrow({
				where: {
					id: topicId
				},
				select: {
					id: true,
					messageCount: true,
					isClosed: true
				}
			});
			const message = await tx.forumMessage.create({
				data: {
					topicId,
					authorId: user.id,
					authorName: user.name,
					content: input.content
				},
				include: messageAuthorInclude
			});
			const reachedLimit = topic.messageCount >= FORUM_MAX_MESSAGES;
			/*
			 * Le 500e message est accepté,
			 * puis le topic est fermé.
			 */
			if (reachedLimit) {
				await tx.forumTopic.update({
					where: {
						id: topicId
					},
					data: {
						isClosed: true
					}
				});
			}
			return {
				message: mapMessage(message),
				topic: {
					id: topic.id,
					messageCount: topic.messageCount,
					isClosed: reachedLimit || topic.isClosed
				}
			};
		});
	},
	async updateMessage(
		topicId: number,
		messageId: number,
		input: UpdateForumMessageBody,
		userId: string
	): Promise<ForumMessageView> {
		/*
		 * On applique les mêmes restrictions de mute que pour
		 * l'envoi d'un nouveau message.
		 */
		await getPostingUser(userId);
		/*
		 * updateMany nous permet d'effectuer le contrôle
		 * d'appartenance et la modification en une seule opération.
		 */
		const updated = await prisma.forumMessage.updateMany({
			where: {
				id: messageId,
				topicId,
				authorId: userId
			},
			data: {
				content: input.content
			}
		});
		if (updated.count === 0) {
			const existing = await prisma.forumMessage.findFirst({
				where: {
					id: messageId,
					topicId
				},
				select: {
					id: true
				}
			});
			if (!existing) {
				throw forumError('forum.message.notFound', 404);
			}
			throw forumError('forum.message.forbidden', 403);
		}
		const message = await prisma.forumMessage.findUniqueOrThrow({
			where: {
				id: messageId
			},
			include: messageAuthorInclude
		});
		return mapMessage(message);
	},
	async toggleFavorite(topicId: number, userId: string) {
		const topic = await prisma.forumTopic.findUnique({
			where: {
				id: topicId
			},
			select: {
				id: true
			}
		});
		if (!topic) {
			throw forumError('forum.topic.notFound', 404);
		}
		const key = {
			userId_topicId: {
				userId,
				topicId
			}
		};
		const favorite = await prisma.forumFavorite.findUnique({
			where: key
		});
		if (favorite) {
			await prisma.forumFavorite.delete({
				where: key
			});
			return {
				favorite: false
			};
		}
		await prisma.forumFavorite.create({
			data: {
				userId,
				topicId
			}
		});
		return {
			favorite: true
		};
	},
	async setPinned(topicId: number, isPinned: boolean) {
		const existing = await prisma.forumTopic.findUnique({
			where: {
				id: topicId
			},
			select: {
				id: true
			}
		});
		if (!existing) {
			throw forumError('forum.topic.notFound', 404);
		}
		await prisma.forumTopic.update({
			where: {
				id: topicId
			},
			data: {
				isPinned
			}
		});
		return {
			success: true
		};
	},
	async setClosed(topicId: number, isClosed: boolean) {
		const existing = await prisma.forumTopic.findUnique({
			where: {
				id: topicId
			},
			select: {
				id: true,
				messageCount: true
			}
		});
		if (!existing) {
			throw forumError('forum.topic.notFound', 404);
		}
		/*
		 * Une fois la limite de 500 atteinte,
		 * même un modérateur ne peut pas
		 * rouvrir le topic.
		 */
		if (!isClosed && existing.messageCount >= FORUM_MAX_MESSAGES) {
			throw forumError('forum.topic.full', 409);
		}
		await prisma.forumTopic.update({
			where: {
				id: topicId
			},
			data: {
				isClosed
			}
		});
		return {
			success: true
		};
	}
};
