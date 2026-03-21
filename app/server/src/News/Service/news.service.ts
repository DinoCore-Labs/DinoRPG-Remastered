import type { Language } from '@dinorpg/core/models/config/language.js';
import { resolveNewsTranslation, resolvePollOptionTranslation } from '@dinorpg/core/models/news/newsUtils.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';
import {
	adminNewsDetailsInclude,
	AdminNewsDetailsRecord,
	newsRepository,
	PublicNewsRecord
} from '../Controller/newsRepository.controller.js';
import type { CreateNewsBody, UpdateNewsBody } from '../Schema/news.schema.js';

function ensureUniqueLanguages<T extends { lang: Language }>(items: T[], errorMessage: string) {
	const unique = new Set(items.map(item => item.lang));
	if (unique.size !== items.length) {
		throw new ExpectedError(errorMessage);
	}
}

function validateNewsTranslations(
	translations: CreateNewsBody['translations'] | NonNullable<UpdateNewsBody['translations']>
) {
	if (translations.length === 0) {
		throw new ExpectedError('At least one news translation is required');
	}

	ensureUniqueLanguages(translations, 'Duplicate news translation language');

	for (const translation of translations) {
		if (!translation.title.trim()) {
			throw new ExpectedError(`Missing title for language ${translation.lang}`);
		}
		if (!translation.content.trim()) {
			throw new ExpectedError(`Missing content for language ${translation.lang}`);
		}
	}
}

function validatePollInput(poll: NonNullable<CreateNewsBody['poll'] | UpdateNewsBody['poll']>) {
	if (poll.options.length < 2) {
		throw new ExpectedError('A poll requires at least 2 options');
	}

	if (poll.endAt <= new Date()) {
		throw new ExpectedError('Poll end date must be in the future');
	}

	for (const option of poll.options) {
		if (option.translations.length === 0) {
			throw new ExpectedError('Each poll option must have at least one translation');
		}

		ensureUniqueLanguages(option.translations, 'Duplicate poll option translation language');

		for (const translation of option.translations) {
			if (!translation.label.trim()) {
				throw new ExpectedError(`Missing poll option label for language ${translation.lang}`);
			}
		}
	}
}

export const newsService = {
	async createAdminNews(input: CreateNewsBody, image?: Uint8Array, imageMimeType?: string | null) {
		validateNewsTranslations(input.translations);

		if (input.poll) {
			validatePollInput(input.poll);
		}

		return prisma.$transaction(async tx => {
			const createdNews = await tx.news.create({
				data: {
					slug: input.slug,
					type: input.type,
					isPublished: input.isPublished ?? false,
					publishedAt: input.publishedAt ?? null,
					image: new Uint8Array(),
					imageMimeType: imageMimeType ?? null,
					translations: {
						create: input.translations.map(translation => ({
							lang: translation.lang,
							title: translation.title,
							excerpt: translation.excerpt ?? null,
							content: translation.content
						}))
					},
					poll: input.poll
						? {
								create: {
									isActive: input.poll.isActive ?? true,
									endAt: input.poll.endAt,
									options: {
										create: input.poll.options.map((option, index) => ({
											sortOrder: option.sortOrder ?? index,
											translations: {
												create: option.translations.map(translation => ({
													lang: translation.lang,
													label: translation.label
												}))
											}
										}))
									}
								}
							}
						: undefined
				},
				include: adminNewsDetailsInclude
			});

			return createdNews;
		});
	},

	async updateAdminNews(newsId: number, input: UpdateNewsBody, image?: Uint8Array, imageMimeType?: string | null) {
		const existingNews = await newsRepository.findNewsById(newsId);
		if (!existingNews) {
			throw new ExpectedError('News not found');
		}

		if (input.translations) {
			validateNewsTranslations(input.translations);
		}

		if (input.poll) {
			validatePollInput(input.poll);
		}

		return prisma.$transaction(async tx => {
			if (input.translations) {
				await tx.newsTranslation.deleteMany({
					where: { newsId }
				});
			}

			if (input.poll !== undefined && existingNews.poll) {
				await tx.poll.delete({
					where: { id: existingNews.poll.id }
				});
			}

			const updatedNews = await tx.news.update({
				where: { id: newsId },
				data: {
					slug: input.slug,
					type: input.type,
					isPublished: input.isPublished,
					publishedAt: input.publishedAt,
					image: image ? new Uint8Array(image) : null,
					imageMimeType: input.removeImage ? null : (imageMimeType ?? undefined),
					translations: input.translations
						? {
								create: input.translations.map(translation => ({
									lang: translation.lang,
									title: translation.title,
									excerpt: translation.excerpt ?? null,
									content: translation.content
								}))
							}
						: undefined,
					poll:
						input.poll !== undefined
							? input.poll
								? {
										create: {
											isActive: input.poll.isActive ?? true,
											endAt: input.poll.endAt,
											options: {
												create: input.poll.options.map((option, index) => ({
													sortOrder: option.sortOrder ?? index,
													translations: {
														create: option.translations.map(translation => ({
															lang: translation.lang,
															label: translation.label
														}))
													}
												}))
											}
										}
									}
								: undefined
							: undefined
				},
				include: adminNewsDetailsInclude
			});

			return updatedNews;
		});
	},

	async getAdminNewsList() {
		return newsRepository.findAdminNewsList();
	},

	async getAdminNewsDetails(newsId: number) {
		const news = await newsRepository.findNewsById(newsId);
		if (!news) {
			throw new ExpectedError('News not found');
		}
		return news;
	},

	async getPublicNews(page: number) {
		if (page < 1) {
			throw new ExpectedError('Invalid page');
		}

		return newsRepository.findPublicNewsPage(page, 10);
	},

	async getNewsImage(newsId: number) {
		const image = await newsRepository.findNewsImage(newsId);
		if (!image || !image.image) {
			throw new ExpectedError('News image not found');
		}
		return image;
	},

	async toggleNewsLike(newsId: number, userId: string) {
		const news = await newsRepository.findNewsById(newsId);
		if (!news) {
			throw new ExpectedError('News not found');
		}

		const existingLike = await newsRepository.findNewsLike(newsId, userId);

		if (existingLike) {
			await newsRepository.deleteNewsLike(newsId, userId);

			return {
				newsId,
				likes: await newsRepository.countNewsLikes(newsId),
				likedByMe: false
			};
		}

		await newsRepository.createNewsLike(newsId, userId);

		return {
			newsId,
			likes: await newsRepository.countNewsLikes(newsId),
			likedByMe: true
		};
	},

	async voteToPoll(pollId: number, optionId: number, userId: string) {
		const poll = await newsRepository.findPollById(pollId, userId);
		if (!poll) {
			throw new ExpectedError('Poll not found');
		}

		if (!poll.isActive || poll.endAt <= new Date()) {
			throw new ExpectedError('Poll is over');
		}

		const option = poll.options.find(item => item.id === optionId);
		if (!option) {
			throw new ExpectedError('Invalid poll option');
		}

		const currentVote = poll.votes[0];
		if (currentVote && currentVote.pollOptionId === optionId) {
			return { success: true };
		}

		await newsRepository.upsertPollVote(pollId, optionId, userId);

		return { success: true };
	},

	mapAdminNews(news: AdminNewsDetailsRecord) {
		if (!news) throw new ExpectedError('News not found');

		return {
			id: news.id,
			slug: news.slug,
			type: news.type,
			isPublished: news.isPublished,
			publishedAt: news.publishedAt,
			createdAt: news.createdAt,
			updatedAt: news.updatedAt,
			image: {
				hasImage: !!news.image,
				mimeType: news.imageMimeType ?? null
			},
			translations: news.translations,
			poll: news.poll
				? {
						id: news.poll.id,
						isActive: news.poll.isActive,
						endAt: news.poll.endAt,
						totalVotes: news.poll.votes.length,
						options: news.poll.options.map(option => ({
							id: option.id,
							sortOrder: option.sortOrder,
							votes: option._count.votes,
							translations: option.translations
						}))
					}
				: null,
			likes: news.likedBy.length
		};
	},

	mapPublicNewsItem(news: PublicNewsRecord, lang: Language, userId?: string) {
		const translation = resolveNewsTranslation(
			news.translations.map(t => ({
				lang: t.lang as Language,
				title: t.title,
				excerpt: t.excerpt,
				content: t.content,
				createdAt: t.createdAt,
				updatedAt: t.updatedAt
			})),
			lang as Language
		);

		return {
			id: news.id,
			slug: news.slug,
			type: news.type,
			title: translation?.title ?? '',
			excerpt: translation?.excerpt ?? null,
			content: translation?.content ?? '',
			createdAt: news.createdAt,
			publishedAt: news.publishedAt,
			imageUrl: news.image ? `/news/${news.id}/image` : null,
			likes: news.likedBy.length,
			likedByMe: !!userId && news.likedBy.some(like => like.userId === userId),
			poll: news.poll
				? {
						id: news.poll.id,
						isActive: news.poll.isActive,
						endAt: news.poll.endAt,
						totalVotes: news.poll.votes.length,
						myVoteOptionId: news.poll.votes.find(vote => vote.userId === userId)?.pollOptionId ?? null,
						options: news.poll.options.map(option => {
							const optionTranslation = resolvePollOptionTranslation(
								option.translations.map(t => ({
									lang: t.lang as Language,
									label: t.label,
									createdAt: t.createdAt,
									updatedAt: t.updatedAt
								})),
								lang as Language
							);

							return {
								id: option.id,
								sortOrder: option.sortOrder,
								label: optionTranslation?.label ?? ''
							};
						})
					}
				: null
		};
	}
};
