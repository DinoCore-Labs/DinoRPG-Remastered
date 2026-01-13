import { prisma } from '../../prisma.js';
import { UpdateUserProfileInput } from '../Schema/user.schema.js';

export async function getOwnProfileService(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			profile: true,
			rewards: true
		}
	});

	if (!user || !user.profile) return null;

	const avatar = user.profile.avatar
		? `data:${user.profile.avatarType};base64,${Buffer.from(user.profile.avatar).toString('base64')}`
		: null;

	return {
		id: user.id,
		name: user.name,
		createdAt: user.createdDate,
		description: user.profile.description,
		language: user.profile.language,
		gender: user.profile.gender,
		age: user.profile.age,
		avatar,
		rewards: user.rewards.map(r => r.rewardId)
	};
}

export async function getUserProfileService(id: string) {
	const user = await prisma.user.findUnique({
		where: { id },
		include: {
			profile: true,
			rewards: true
		}
	});

	if (!user || !user.profile) return null;

	const avatar = user.profile.avatar
		? `data:${user.profile.avatarType};base64,${Buffer.from(user.profile.avatar).toString('base64')}`
		: null;

	return {
		id: user.id,
		name: user.name,
		createdAt: user.createdDate,
		description: user.profile.description,
		language: user.profile.language,
		gender: user.profile.gender,
		age: user.profile.age,
		avatar,
		rewards: user.rewards.map(r => r.rewardId)
	};
}

export async function updateProfileService(userId: string, data: UpdateUserProfileInput) {
	return prisma.userProfile.update({
		where: { userId },
		data: {
			description: data.description ?? null,
			language: data.language ?? null,
			gender: data.gender ?? null,
			age: data.age ?? null
		}
	});
}

export async function updateAvatarService(userId: string, buffer: Buffer) {
	const uint8 = new Uint8Array(buffer);

	return prisma.userProfile.update({
		where: { userId },
		data: {
			avatar: uint8,
			avatarType: 'image/webp'
		}
	});
}
