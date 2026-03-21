import { Language } from '../config/language.js';

export interface PollOptionTranslation {
	lang: Language;
	label: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PollOption {
	id: number;
	sortOrder: number;
	createdAt: Date;
	translations: PollOptionTranslation[];
}

export interface PollVote {
	id: number;
	pollId: number;
	pollOptionId: number;
	userId: string;
	votedAt: Date;
}

export interface Poll {
	id: number;
	newsId: number;
	isActive: boolean;
	endAt: Date;
	createdAt: Date;
	updatedAt: Date;
	options: PollOption[];
	votes: PollVote[];
}

export interface PublicPollOption {
	id: number;
	label: string;
	sortOrder: number;
}

export interface PublicPoll {
	id: number;
	isActive: boolean;
	endAt: Date;
	totalVotes: number;
	myVoteOptionId: number | null;
	options: PublicPollOption[];
}

export interface AdminPollOptionDetails {
	id: number;
	sortOrder: number;
	votes: number;
	translations: PollOptionTranslation[];
}

export interface AdminPollDetails {
	id: number;
	isActive: boolean;
	endAt: Date;
	totalVotes: number;
	options: AdminPollOptionDetails[];
}
