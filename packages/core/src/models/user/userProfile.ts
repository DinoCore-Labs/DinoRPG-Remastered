import { Language } from '../config/language.js';
import { Reward } from '../rewards/rewardList.js';
import { Gender } from './userGender.js';

export interface UserProfile {
	userId: string;
	name: string;
	avatar: string | null; // Base64 depuis le backend
	avatarType: string | null; // ex: "image/webp"
	description: string | null;
	language: Language | null;
	gender: Gender | null;
	age: number | null;
	rewards: Reward[];
}

export interface UserProfileUpdate {
	description?: string | null;
	language?: Language | null;
	gender?: Gender | null;
	age?: number | null;
}
