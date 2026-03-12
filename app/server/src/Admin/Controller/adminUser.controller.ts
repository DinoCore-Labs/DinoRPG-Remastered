import { AdminDinozSummary, AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import {
	UpdateAdminUserInventoryPayload,
	UpdateAdminUserProfilePayload,
	UpdateAdminUserRewardsPayload,
	UpdateAdminUserUniqueSkillsPayload,
	UpdateAdminUserWalletPayload
} from '@dinorpg/core/models/admin/adminUserPayloads.js';

import { prisma } from '../../prisma.js';

export async function getAdminUserDetails(userId: string): Promise<AdminUserDetails | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			role: true,
			lastLogin: true,
			leader: true,
			engineer: true,
			cooker: true,
			shopKeeper: true,
			merchant: true,
			priest: true,
			teacher: true,
			matelasseur: true,
			messie: true,
			profile: {
				select: {
					avatar: true,
					age: true,
					language: true,
					description: true
				}
			},
			wallets: {
				select: {
					type: true,
					amount: true
				}
			},
			rewards: {
				select: {
					rewardId: true
				}
			},
			items: {
				select: {
					itemId: true,
					quantity: true
				},
				orderBy: {
					itemId: 'asc'
				}
			},
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				},
				orderBy: {
					ingredientId: 'asc'
				}
			}
			/*quests: {
				select: {
					questId: true,
					progression: true
				},
				orderBy: {
					questId: 'asc'
				}
			},
			banCase: {
				select: {
					id: true,
					reason: true,
					sorted: true,
					comment: true,
					dinozId: true,
					reporterId: true,
					banDate: true,
					banEndDate: true
				}
			}*/
		}
	});

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		name: user.name,
		role: user.role,
		lastLogin: user.lastLogin,
		profile: user.profile
			? {
					avatar: user.profile.avatar ? Buffer.from(user.profile.avatar).toString('base64') : null,
					age: user.profile.age ?? null,
					language: user.profile.language ?? null,
					description: user.profile.description ?? null
				}
			: null,
		wallets: user.wallets,
		rewards: user.rewards,
		items: user.items,
		ingredients: user.ingredients,
		uniqueSkills: {
			leader: user.leader,
			engineer: user.engineer,
			cooker: user.cooker,
			shopKeeper: user.shopKeeper,
			merchant: user.merchant,
			priest: user.priest,
			teacher: user.teacher,
			matelasseur: user.matelasseur,
			messie: user.messie
		}
		/*quests: user.quests,
		banCase: user.banCase
			? {
					...user.banCase,
					banDate: user.banCase.banDate ? user.banCase.banDate.toISOString() : null,
					banEndDate: user.banCase.banEndDate ? user.banCase.banEndDate.toISOString() : null
				}
			: null,*/
	};
}

export async function getAdminUserDinoz(userId: string): Promise<AdminDinozSummary[]> {
	return prisma.dinoz.findMany({
		where: {
			userId
		},
		select: {
			id: true,
			name: true,
			level: true,
			raceId: true,
			life: true,
			maxLife: true
		},
		orderBy: [{ level: 'desc' }, { id: 'asc' }]
	});
}

export async function updateAdminUserProfile(userId: string, payload: UpdateAdminUserProfilePayload): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			role: payload.role,
			profile: {
				upsert: {
					create: {
						description: payload.description,
						avatar: null
					},
					update: {
						description: payload.description,
						...(payload.removeAvatar ? { avatar: null } : {})
					}
				}
			}
		}
	});
}

export async function updateAdminUserWallet(userId: string, payload: UpdateAdminUserWalletPayload): Promise<void> {
	const wallet = await prisma.userWallet.findUnique({
		where: {
			userId_type: {
				userId,
				type: payload.type
			}
		}
	});
	if (!wallet) {
		if (payload.operation === 'remove') {
			throw new Error(`Wallet ${payload.type} not found`);
		}
		await prisma.userWallet.create({
			data: {
				userId,
				type: payload.type,
				amount: payload.amount
			}
		});
		return;
	}
	const nextAmount =
		payload.operation === 'add' ? wallet.amount + payload.amount : Math.max(0, wallet.amount - payload.amount);
	await prisma.userWallet.update({
		where: {
			userId_type: {
				userId,
				type: payload.type
			}
		},
		data: {
			amount: nextAmount
		}
	});
}

export async function updateAdminUserUniqueSkills(
	userId: string,
	payload: UpdateAdminUserUniqueSkillsPayload
): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			leader: payload.uniqueSkills.leader,
			engineer: payload.uniqueSkills.engineer,
			cooker: payload.uniqueSkills.cooker,
			shopKeeper: payload.uniqueSkills.shopKeeper,
			merchant: payload.uniqueSkills.merchant,
			priest: payload.uniqueSkills.priest,
			teacher: payload.uniqueSkills.teacher,
			matelasseur: payload.uniqueSkills.matelasseur,
			messie: payload.uniqueSkills.messie
		}
	});
}

export async function updateAdminUserItems(userId: string, payload: UpdateAdminUserInventoryPayload): Promise<void> {
	const item = await prisma.userItems.findUnique({
		where: {
			itemId_userId: {
				itemId: payload.id,
				userId
			}
		}
	});
	if (!item) {
		if (payload.operation === 'remove') {
			return;
		}
		await prisma.userItems.create({
			data: {
				userId,
				itemId: payload.id,
				quantity: payload.quantity
			}
		});
		return;
	}
	const nextQuantity =
		payload.operation === 'add' ? item.quantity + payload.quantity : Math.max(0, item.quantity - payload.quantity);
	await prisma.userItems.update({
		where: {
			itemId_userId: {
				itemId: payload.id,
				userId
			}
		},
		data: {
			quantity: nextQuantity
		}
	});
}

export async function updateAdminUserIngredients(
	userId: string,
	payload: UpdateAdminUserInventoryPayload
): Promise<void> {
	const ingredient = await prisma.userIngredients.findUnique({
		where: {
			ingredientId_userId: {
				ingredientId: payload.id,
				userId
			}
		}
	});
	if (!ingredient) {
		if (payload.operation === 'remove') {
			return;
		}
		await prisma.userIngredients.create({
			data: {
				userId,
				ingredientId: payload.id,
				quantity: payload.quantity
			}
		});
		return;
	}
	const nextQuantity =
		payload.operation === 'add'
			? ingredient.quantity + payload.quantity
			: Math.max(0, ingredient.quantity - payload.quantity);
	await prisma.userIngredients.update({
		where: {
			ingredientId_userId: {
				ingredientId: payload.id,
				userId
			}
		},
		data: {
			quantity: nextQuantity
		}
	});
}

export async function updateAdminUserRewards(userId: string, payload: UpdateAdminUserRewardsPayload): Promise<void> {
	const reward = await prisma.userRewards.findUnique({
		where: {
			rewardId_userId: {
				rewardId: payload.rewardId,
				userId
			}
		}
	});
	if (payload.operation === 'add') {
		if (reward) return;
		await prisma.userRewards.create({
			data: {
				userId,
				rewardId: payload.rewardId
			}
		});
		return;
	}
	if (!reward) return;
	await prisma.userRewards.delete({
		where: {
			rewardId_userId: {
				rewardId: payload.rewardId,
				userId
			}
		}
	});
}
