import {
	FORUM_MAX_MESSAGES,
	FORUM_MESSAGES_PER_PAGE,
	FORUM_TOPICS_PER_PAGE,
	type ForumCategory,
	type ForumMessageView,
	type ForumTopicSummary
} from '@dinorpg/core/models/forum/forum.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';
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

async function getUnreadTopicIds(userId: string | undefined, topicIds: number[]): Promise<Set<number>> {
	if (!userId || topicIds.length === 0) {
		return new Set();
	}
	const [reads, latestMessages] = await Promise.all([
		prisma.forumTopicRead.findMany({
			where: {
				userId,
				topicId: {
					in: topicIds
				}
			},
			select: {
				topicId: true,
				lastReadMessageId: true
			}
		}),
		prisma.forumMessage.groupBy({
			by: ['topicId'],
			where: {
				topicId: {
					in: topicIds
				}
			},
			_max: {
				id: true
			}
		})
	]);
	const lastReadByTopic = new Map(reads.map(read => [read.topicId, read.lastReadMessageId]));
	const unreadTopicIds = new Set<number>();
	for (const latest of latestMessages) {
		const latestMessageId = latest._max.id;
		if (latestMessageId === null) {
			continue;
		}
		const lastReadMessageId = lastReadByTopic.get(latest.topicId);
		if (lastReadMessageId === undefined || latestMessageId > lastReadMessageId) {
			unreadTopicIds.add(latest.topicId);
		}
	}
	return unreadTopicIds;
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
	favoriteIds: Set<number>,
	unreadTopicIds: Set<number> = new Set()
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
		isFavorite: favoriteIds.has(topic.id),
		hasUnreadMessages: unreadTopicIds.has(topic.id)
	};
}

function mapMessage(
	message: {
		id: number;
		topicId: number;
		content: string;
		authorId: string | null;
		authorName: string;
		deletedAt: Date | null;
		deletionKind: 'AUTHOR' | 'MODERATION' | null;
		deletionReason: string | null;
		createdAt: Date;
		updatedAt: Date;
		author: {
			role: Role;

			profile: {
				avatar: Uint8Array | Buffer | null;

				avatarType: string | null;
			} | null;
		} | null;
	},
	canViewDeletedContent = false
): ForumMessageView {
	const avatar = message.author?.profile?.avatar;
	const avatarType = message.author?.profile?.avatarType;
	const isDeleted = message.deletedAt !== null;
	return {
		id: message.id,
		topicId: message.topicId,
		content: isDeleted && !canViewDeletedContent ? '' : message.content,
		authorId: message.authorId,
		authorName: message.authorName,
		authorRole: message.author?.role ?? null,
		avatarUrl: avatar ? `data:${avatarType ?? 'image/webp'};base64,${Buffer.from(avatar).toString('base64')}` : null,
		isDeleted,
		deletedAt: message.deletedAt?.toISOString() ?? null,
		deletionKind: message.deletionKind,
		deletionReason: canViewDeletedContent ? message.deletionReason : null,
		createdAt: message.createdAt.toISOString(),
		updatedAt: message.updatedAt.toISOString()
	};
}

function isForumModerator(role: Role | undefined): boolean {
	return role === 'MODERATOR' || role === 'ADMIN' || role === 'SUPER_ADMIN';
}

async function isTopicSubscribed(userId: string | undefined, topicId: number): Promise<boolean> {
	if (!userId) {
		return false;
	}
	const subscription = await prisma.forumSubscription.findUnique({
		where: {
			userId_topicId: {
				userId,
				topicId
			}
		},
		select: {
			userId: true
		}
	});
	return subscription !== null;
}

async function getForumActor(userId: string): Promise<{
	id: string;
	name: string;
}> {
	const actor = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			id: true,
			name: true
		}
	});
	if (!actor) {
		throw forumError('forum.user.notFound', 404);
	}
	return actor;
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
		const topicIds = topics.map(topic => topic.id);
		const [favoriteIds, unreadTopicIds] = await Promise.all([
			getFavoriteIds(userId, topicIds),
			getUnreadTopicIds(userId, topicIds)
		]);
		return {
			topics: topics.map(topic => mapTopic(topic, favoriteIds, unreadTopicIds)),
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
							deletedAt: null,
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
		const topicIds = topics.map(topic => topic.id);
		const favoriteIds = new Set(topicIds);
		const unreadTopicIds = await getUnreadTopicIds(userId, topicIds);
		return {
			topics: topics.map(topic => mapTopic(topic, favoriteIds, unreadTopicIds)),
			page,
			pageCount: Math.max(1, Math.ceil(total / FORUM_TOPICS_PER_PAGE)),
			total
		};
	},
	async getTopic(topicId: number, page: number, userId?: string, userRole?: Role) {
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
		const [messages, favoriteIds, isSubscribed] = await Promise.all([
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
			getFavoriteIds(userId, [topicId]),
			isTopicSubscribed(userId, topicId)
		]);
		const unreadTopicIds = await getUnreadTopicIds(userId, [topicId]);
		const canViewDeletedContent = isForumModerator(userRole);
		return {
			topic: mapTopic(topic, favoriteIds, unreadTopicIds),
			messages: messages.map(message => mapMessage(message, canViewDeletedContent)),
			isSubscribed,
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
				},
				subscriptions: {
					create: {
						user: {
							connect: {
								id: user.id
							}
						}
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
					title: true,
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
			const subscriptions = await tx.forumSubscription.findMany({
				where: {
					topicId,
					/*
					 * L'auteur de la réponse ne doit évidemment
					 * pas recevoir sa propre notification.
					 */
					userId: {
						not: user.id
					}
				},
				select: {
					userId: true
				}
			});
			if (subscriptions.length > 0) {
				const page = Math.max(1, Math.ceil(topic.messageCount / FORUM_MESSAGES_PER_PAGE));
				await tx.notification.createMany({
					data: subscriptions.map(subscription => ({
						userId: subscription.userId,
						type: NotificationType.FORUM_TOPIC_REPLY,
						content: {
							topicId: topic.id,
							topicTitle: topic.title,
							messageId: message.id,
							page,
							authorName: user.name
						}
					}))
				});
			}
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
	async deleteMessage(topicId: number, messageId: number, userId: string) {
		const message = await prisma.forumMessage.findFirst({
			where: {
				id: messageId,
				topicId
			},
			select: {
				id: true,
				authorId: true,
				authorName: true,
				deletedAt: true
			}
		});
		if (!message) {
			throw forumError('forum.message.notFound', 404);
		}
		if (message.authorId !== userId) {
			throw forumError('forum.message.forbidden', 403);
		}
		if (message.deletedAt) {
			return {
				success: true as const
			};
		}
		await prisma.forumMessage.update({
			where: {
				id: message.id
			},
			data: {
				deletedAt: new Date(),
				deletedById: userId,
				deletedByName: message.authorName,
				deletionKind: 'AUTHOR',
				deletionReason: null
			}
		});
		return {
			success: true as const
		};
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
	async setPinned(topicId: number, isPinned: boolean, actorId: string) {
		const actor = await getForumActor(actorId);
		return prisma.$transaction(async tx => {
			const existing = await tx.forumTopic.findUnique({
				where: {
					id: topicId
				},
				select: {
					id: true,
					isPinned: true
				}
			});
			if (!existing) {
				throw forumError('forum.topic.notFound', 404);
			}
			/*
			 * Si l'état demandé est déjà appliqué,
			 * on ne modifie rien et surtout on ne crée
			 * pas une fausse entrée dans l'historique.
			 */
			if (existing.isPinned === isPinned) {
				return {
					success: true as const
				};
			}
			await tx.forumTopic.update({
				where: {
					id: topicId
				},
				data: {
					isPinned
				}
			});
			await tx.forumModerationAction.create({
				data: {
					topicId,
					actorId: actor.id,
					actorName: actor.name,
					action: isPinned ? 'TOPIC_PIN' : 'TOPIC_UNPIN'
				}
			});
			return {
				success: true as const
			};
		});
	},
	async setClosed(topicId: number, isClosed: boolean, actorId: string) {
		const actor = await getForumActor(actorId);
		return prisma.$transaction(async tx => {
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
			/*
			 * Une fois les 500 messages atteints,
			 * le topic ne peut pas être rouvert.
			 */
			if (!isClosed && existing.messageCount >= FORUM_MAX_MESSAGES) {
				throw forumError('forum.topic.full', 409);
			}
			/*
			 * Même principe que pour le pin :
			 * pas de doublon dans l'historique.
			 */
			if (existing.isClosed === isClosed) {
				return {
					success: true as const
				};
			}
			await tx.forumTopic.update({
				where: {
					id: topicId
				},
				data: {
					isClosed
				}
			});
			await tx.forumModerationAction.create({
				data: {
					topicId,
					actorId: actor.id,
					actorName: actor.name,
					action: isClosed ? 'TOPIC_CLOSE' : 'TOPIC_REOPEN'
				}
			});
			return {
				success: true as const
			};
		});
	},
	async getFirstUnread(topicId: number, userId: string) {
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
		const read = await prisma.forumTopicRead.findUnique({
			where: {
				userId_topicId: {
					userId,
					topicId
				}
			},
			select: {
				lastReadMessageId: true
			}
		});
		const firstUnread = await prisma.forumMessage.findFirst({
			where: {
				topicId,
				...(read
					? {
							id: {
								gt: read.lastReadMessageId
							}
						}
					: {})
			},
			orderBy: [
				{
					createdAt: 'asc'
				},
				{
					id: 'asc'
				}
			],
			select: {
				id: true,
				createdAt: true
			}
		});
		if (!firstUnread) {
			return {
				messageId: null,
				page: null
			};
		}
		/*
		 * On calcule combien de messages se trouvent avant lui
		 * en respectant exactement le même ordre que getTopic().
		 */
		const messagesBefore = await prisma.forumMessage.count({
			where: {
				topicId,
				OR: [
					{
						createdAt: {
							lt: firstUnread.createdAt
						}
					},
					{
						createdAt: firstUnread.createdAt,
						id: {
							lt: firstUnread.id
						}
					}
				]
			}
		});
		return {
			messageId: firstUnread.id,
			page: Math.floor(messagesBefore / FORUM_MESSAGES_PER_PAGE) + 1
		};
	},
	async markTopicRead(topicId: number, messageId: number, userId: string) {
		const message = await prisma.forumMessage.findFirst({
			where: {
				id: messageId,
				topicId
			},
			select: {
				id: true
			}
		});
		if (!message) {
			throw forumError('forum.message.notFound', 404);
		}
		const existing = await prisma.forumTopicRead.findUnique({
			where: {
				userId_topicId: {
					userId,
					topicId
				}
			},
			select: {
				lastReadMessageId: true
			}
		});
		/*
		 * Si l'utilisateur revient sur une ancienne page,
		 * on ne doit JAMAIS faire reculer son curseur.
		 */
		if (existing && existing.lastReadMessageId >= message.id) {
			return {
				success: true as const
			};
		}
		await prisma.forumTopicRead.upsert({
			where: {
				userId_topicId: {
					userId,
					topicId
				}
			},
			create: {
				userId,
				topicId,
				lastReadMessageId: message.id
			},
			update: {
				lastReadMessageId: message.id
			}
		});
		return {
			success: true as const
		};
	},
	async toggleSubscription(topicId: number, userId: string) {
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
		const subscription = await prisma.forumSubscription.findUnique({
			where: key
		});
		if (subscription) {
			await prisma.forumSubscription.delete({
				where: key
			});
			return {
				subscribed: false
			};
		}
		await prisma.forumSubscription.create({
			data: {
				userId,
				topicId
			}
		});
		return {
			subscribed: true
		};
	},
	async setMessageModeration(
		topicId: number,
		messageId: number,
		isDeleted: boolean,
		reason: string | undefined,
		actorId: string
	) {
		const actor = await getForumActor(actorId);
		return prisma.$transaction(async tx => {
			const message = await tx.forumMessage.findFirst({
				where: {
					id: messageId,
					topicId
				},
				select: {
					id: true,
					deletedAt: true,
					deletionKind: true
				}
			});
			if (!message) {
				throw forumError('forum.message.notFound', 404);
			}
			if (isDeleted) {
				if (message.deletedAt) {
					throw forumError('forum.message.alreadyDeleted', 409);
				}
				await tx.forumMessage.update({
					where: {
						id: messageId
					},
					data: {
						deletedAt: new Date(),
						deletedById: actor.id,
						deletedByName: actor.name,
						deletionKind: 'MODERATION',
						deletionReason: reason?.trim()
					}
				});
				await tx.forumModerationAction.create({
					data: {
						topicId,
						messageId,
						actorId: actor.id,
						actorName: actor.name,
						action: 'MESSAGE_DELETE',
						reason: reason?.trim()
					}
				});
				return {
					success: true as const
				};
			}
			/*
			 * Empêche l'auteur
			 * de restaurer un message supprimé
			 */
			if (message.deletionKind !== 'MODERATION') {
				throw forumError('forum.message.notRestorable', 409);
			}
			await tx.forumMessage.update({
				where: {
					id: messageId
				},
				data: {
					deletedAt: null,
					deletedById: null,
					deletedByName: null,
					deletionKind: null,
					deletionReason: null
				}
			});
			await tx.forumModerationAction.create({
				data: {
					topicId,
					messageId,
					actorId: actor.id,
					actorName: actor.name,
					action: 'MESSAGE_RESTORE'
				}
			});
			return {
				success: true as const
			};
		});
	}
};
