import { AdminDinozSummary, AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import {
	UpdateAdminUserProfilePayload,
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
			},
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
			},*/
			dinoz: {
				select: {
					id: true,
					skills: {
						select: {
							skillId: true,
							state: true,
							dinozId: true
						}
					}
				}
			}
		}
	});

	if (!user) {
		return null;
	}

	return {
		id: user.id,
		name: user.name,
		role: user.role,
		wallets: user.wallets,
		rewards: user.rewards,
		items: user.items,
		ingredients: user.ingredients,
		/*quests: user.quests,
		banCase: user.banCase
			? {
					...user.banCase,
					banDate: user.banCase.banDate ? user.banCase.banDate.toISOString() : null,
					banEndDate: user.banCase.banEndDate ? user.banCase.banEndDate.toISOString() : null
				}
			: null,*/
		uniqueSkills: user.dinoz.flatMap(dinoz => dinoz.skills)
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
			role: payload.role
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
