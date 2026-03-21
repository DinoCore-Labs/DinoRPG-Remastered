import { Language } from '../config/language.js';
import { Poll, PublicPoll } from './poll.js';

export enum NewsType {
	UPDATE = 'update',
	INFORMATION = 'information',
	WAR = 'war',
	WAR_MANA = 'war_mana',
	CHAMPIONSHIP = 'championship',
	TID_START = 'tid_start',
	TID_END = 'tid_end',
	EVENT_CHRISTMAS = 'event_christmas',
	STORY = 'story',
	ANNOUNCE = 'announce'
}

export interface NewsImage {
	data: number[];
	mimeType: string;
}

export interface NewsTranslation {
	lang: Language;
	title: string;
	excerpt: string | null;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface NewsBase {
	id: number;
	slug: string;
	type: NewsType;
	isPublished: boolean;
	publishedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface NewsLikeSummary {
	userId: string;
	createdAt: Date;
}

export interface DetailedNews extends NewsBase {
	image: NewsImage | null;
	translations: NewsTranslation[];
	poll: Poll | null;
	likes: number;
	likedByMe: boolean;
}

export interface AdminNewsListItem extends NewsBase {
	translations: Array<Pick<NewsTranslation, 'lang' | 'title'>>;
	hasImage: boolean;
	hasPoll: boolean;
}

export interface PublicNewsListItem {
	id: number;
	slug: string;
	type: NewsType;
	title: string;
	excerpt: string | null;
	content: string;
	createdAt: Date;
	publishedAt: Date | null;
	imageUrl: string | null;
	likes: number;
	likedByMe: boolean;
	poll: PublicPoll | null;
}
