import { Language } from '../config/language.js';
import { NewsType } from './news.js';

export interface UpsertNewsTranslationInput {
	lang: Language;
	title: string;
	excerpt?: string | null;
	content: string;
}

export interface CreateNewsInput {
	slug: string;
	type: NewsType;
	isPublished?: boolean;
	publishedAt?: Date | null;
	translations: UpsertNewsTranslationInput[];
}

export interface UpdateNewsInput {
	slug?: string;
	type?: NewsType;
	isPublished?: boolean;
	publishedAt?: Date | null;
	translations?: UpsertNewsTranslationInput[];
	removeImage?: boolean;
}

export interface CreatePollOptionTranslationInput {
	lang: Language;
	label: string;
}

export interface CreatePollOptionInput {
	sortOrder?: number;
	translations: CreatePollOptionTranslationInput[];
}

export interface CreatePollInput {
	newsId: number;
	endAt: Date;
	isActive?: boolean;
	options: CreatePollOptionInput[];
}

export interface UpdatePollOptionTranslationInput {
	lang: Language;
	label: string;
}

export interface UpdatePollOptionInput {
	sortOrder?: number;
	translations: UpdatePollOptionTranslationInput[];
}

export interface UpdatePollInput {
	endAt?: Date;
	isActive?: boolean;
	options?: UpdatePollOptionInput[];
}

export interface ToggleNewsLikeResult {
	newsId: number;
	likes: number;
	likedByMe: boolean;
}

export interface VotePollResult {
	success: boolean;
}
