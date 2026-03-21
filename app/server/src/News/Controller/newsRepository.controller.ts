import { Prisma } from '../../../../prisma/client.js';
import { prisma } from '../../prisma.js';

export const adminNewsDetailsInclude = {
	translations: {
		orderBy: { lang: 'asc' as const }
	},
	poll: {
		include: {
			options: {
				orderBy: { sortOrder: 'asc' as const },
				include: {
					translations: {
						orderBy: { lang: 'asc' as const }
					},
					_count: {
						select: {
							votes: true
						}
					}
				}
			},
			votes: true
		}
	},
	likedBy: true
} satisfies Prisma.NewsInclude;

export type AdminNewsDetailsRecord = Prisma.NewsGetPayload<{
	include: typeof adminNewsDetailsInclude;
}>;

export const publicNewsInclude = {
	translations: {
		orderBy: { lang: 'asc' as const }
	},
	poll: {
		include: {
			options: {
				orderBy: { sortOrder: 'asc' as const },
				include: {
					translations: {
						orderBy: { lang: 'asc' as const }
					}
				}
			},
			votes: {
				select: {
					userId: true,
					pollOptionId: true
				}
			}
		}
	},
	likedBy: {
		select: {
			userId: true
		}
	}
} satisfies Prisma.NewsInclude;

export type PublicNewsRecord = Prisma.NewsGetPayload<{
	include: typeof publicNewsInclude;
}>;

export const newsRepository = {
	findNewsById(id: number) {
		return prisma.news.findUnique({
			where: { id },
			include: adminNewsDetailsInclude
		});
	},

	findAdminNewsList() {
		return prisma.news.findMany({
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				slug: true,
				type: true,
				isPublished: true,
				publishedAt: true,
				createdAt: true,
				updatedAt: true,
				image: true,
				poll: {
					select: { id: true }
				},
				translations: {
					select: {
						lang: true,
						title: true
					},
					orderBy: { lang: 'asc' }
				}
			}
		});
	},

	findPublicNewsPage(page: number, take: number) {
		return prisma.news.findMany({
			where: {
				isPublished: true,
				OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }]
			},
			orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
			skip: (page - 1) * take,
			take,
			include: publicNewsInclude
		});
	},

	findNewsImage(id: number) {
		return prisma.news.findUnique({
			where: { id },
			select: {
				image: true,
				imageMimeType: true
			}
		});
	},

	findNewsLike(newsId: number, userId: string) {
		return prisma.newsLike.findUnique({
			where: {
				newsId_userId: {
					newsId,
					userId
				}
			}
		});
	},

	createNewsLike(newsId: number, userId: string) {
		return prisma.newsLike.create({
			data: {
				newsId,
				userId
			}
		});
	},

	deleteNewsLike(newsId: number, userId: string) {
		return prisma.newsLike.delete({
			where: {
				newsId_userId: {
					newsId,
					userId
				}
			}
		});
	},

	countNewsLikes(newsId: number) {
		return prisma.newsLike.count({
			where: { newsId }
		});
	},

	findPollById(pollId: number, userId?: string) {
		return prisma.poll.findUnique({
			where: { id: pollId },
			include: {
				options: {
					orderBy: { sortOrder: 'asc' },
					include: {
						translations: {
							orderBy: { lang: 'asc' }
						}
					}
				},
				votes: userId
					? {
							where: { userId }
						}
					: true
			}
		});
	},

	upsertPollVote(pollId: number, pollOptionId: number, userId: string) {
		return prisma.pollVote.upsert({
			where: {
				unique_user_vote_per_poll: {
					pollId,
					userId
				}
			},
			update: {
				pollOptionId,
				votedAt: new Date()
			},
			create: {
				pollId,
				pollOptionId,
				userId
			}
		});
	}
};
