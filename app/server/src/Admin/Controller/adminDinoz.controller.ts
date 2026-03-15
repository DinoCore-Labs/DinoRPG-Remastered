import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozState } from '../../../../prisma/index.js';
import { addSkillToDinozWithEffects } from '../../Level/Service/learnSkill.service.js';
import { prisma } from '../../prisma.js';

async function getOwnedDinozOrThrow(userId: string, dinozId: number) {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId
		},
		include: {
			user: {
				select: {
					name: true
				}
			},
			status: {
				select: {
					id: true,
					statusId: true
				}
			},
			skills: {
				select: {
					id: true,
					skillId: true,
					state: true
				}
			},
			items: {
				select: {
					id: true,
					itemId: true
				}
			},
			followers: {
				select: {
					id: true,
					name: true,
					level: true
				}
			}
		}
	});

	if (!dinoz) {
		throw new ExpectedError('Dinoz introuvable.');
	}

	return dinoz;
}

export async function getAdminDinozDetails(userId: string, dinozId: number): Promise<AdminDinozDetails> {
	const dinoz = await getOwnedDinozOrThrow(userId, dinozId);

	const leaderOptions = await prisma.dinoz.findMany({
		where: {
			userId,
			placeId: dinoz.placeId,
			NOT: {
				id: dinozId
			}
		},
		select: {
			id: true,
			name: true,
			level: true
		},
		orderBy: [{ level: 'desc' }, { id: 'asc' }]
	});

	return {
		id: dinoz.id,
		userId: dinoz.userId,
		userName: dinoz.user.name,
		name: dinoz.name,
		canRename: dinoz.canRename,
		raceId: dinoz.raceId,
		display: dinoz.display,
		level: dinoz.level,
		life: dinoz.life,
		maxLife: dinoz.maxLife,
		experience: dinoz.experience,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		nextUpElementId: dinoz.nextUpElementId,
		nextUpAltElementId: dinoz.nextUpAltElementId,
		placeId: dinoz.placeId,
		remaining: dinoz.remaining,
		seed: dinoz.seed,
		state: dinoz.state ?? null,
		stateTimer: dinoz.stateTimer?.toISOString() ?? null,
		fight: dinoz.fight,
		gather: dinoz.gather,
		leaderId: dinoz.leaderId,
		createdDate: dinoz.createdDate.toISOString(),
		updatedDate: dinoz.updatedDate.toISOString(),
		status: dinoz.status,
		skills: dinoz.skills,
		items: dinoz.items,
		followers: dinoz.followers,
		leaderOptions
	};
}

export async function updateAdminDinozProfile(
	userId: string,
	dinozId: number,
	data: {
		name: string;
		canRename: boolean;
		raceId: number;
		display: string;
	}
) {
	await getOwnedDinozOrThrow(userId, dinozId);

	await prisma.dinoz.update({
		where: { id: dinozId },
		data
	});
}

export async function updateAdminDinozStats(
	userId: string,
	dinozId: number,
	data: {
		level: number;
		life: number;
		maxLife: number;
		experience: number;
		nbrUpFire: number;
		nbrUpWood: number;
		nbrUpWater: number;
		nbrUpLightning: number;
		nbrUpAir: number;
		nextUpElementId: number;
		nextUpAltElementId: number;
		remaining: number;
		order: number | null;
		fight: boolean;
		gather: boolean;
	}
) {
	await getOwnedDinozOrThrow(userId, dinozId);

	if (data.life > data.maxLife) {
		throw new ExpectedError('La vie ne peut pas dépasser la vie maximale.');
	}

	await prisma.dinoz.update({
		where: { id: dinozId },
		data
	});
}

export async function updateAdminDinozState(
	userId: string,
	dinozId: number,
	data: {
		state: DinozState | null;
		stateTimer: string | null;
	}
) {
	await getOwnedDinozOrThrow(userId, dinozId);

	await prisma.dinoz.update({
		where: { id: dinozId },
		data: {
			state: data.state,
			stateTimer: data.stateTimer ? new Date(data.stateTimer) : null
		}
	});
}

export async function teleportAdminDinoz(userId: string, dinozId: number, placeId: number) {
	await getOwnedDinozOrThrow(userId, dinozId);

	await prisma.dinoz.update({
		where: { id: dinozId },
		data: { placeId }
	});
}

export async function updateAdminDinozLeader(userId: string, dinozId: number, leaderId: number | null) {
	const dinoz = await getOwnedDinozOrThrow(userId, dinozId);

	if (leaderId === dinozId) {
		throw new ExpectedError('Un Dinoz ne peut pas se suivre lui-même.');
	}

	if (leaderId !== null) {
		const leader = await prisma.dinoz.findFirst({
			where: {
				id: leaderId,
				userId
			},
			select: {
				id: true,
				placeId: true
			}
		});

		if (!leader) {
			throw new ExpectedError('Leader invalide.');
		}

		if (leader.placeId !== dinoz.placeId) {
			throw new ExpectedError('Le leader doit être sur le même lieu que le Dinoz.');
		}
	}

	await prisma.dinoz.update({
		where: { id: dinozId },
		data: { leaderId }
	});
}

export async function addAdminDinozStatus(userId: string, dinozId: number, statusId: number) {
	await getOwnedDinozOrThrow(userId, dinozId);

	const existing = await prisma.dinozStatus.findFirst({
		where: {
			dinozId,
			statusId
		},
		select: { id: true }
	});

	if (existing) {
		return;
	}

	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

export async function removeAdminDinozStatus(userId: string, dinozId: number, statusId: number) {
	await getOwnedDinozOrThrow(userId, dinozId);

	await prisma.dinozStatus.deleteMany({
		where: {
			dinozId,
			statusId
		}
	});
}

export async function addAdminDinozSkill(
	userId: string,
	dinozId: number,
	data: {
		skillId: number;
		state?: boolean;
	}
) {
	await getOwnedDinozOrThrow(userId, dinozId);

	await addSkillToDinozWithEffects({
		dinozId,
		userId,
		skillId: data.skillId,
		state: data.state ?? true,
		computeUnlockables: true
	});
}

export async function updateAdminDinozSkillState(
	userId: string,
	dinozId: number,
	data: {
		skillId: number;
		state: boolean;
	}
) {
	await getOwnedDinozOrThrow(userId, dinozId);

	const updated = await prisma.dinozSkills.updateMany({
		where: {
			dinozId,
			skillId: data.skillId
		},
		data: {
			state: data.state
		}
	});

	if (updated.count === 0) {
		throw new ExpectedError('Compétence introuvable.');
	}
}

export async function removeAdminDinozSkill(userId: string, dinozId: number, skillId: number) {
	await getOwnedDinozOrThrow(userId, dinozId);

	await prisma.dinozSkills.deleteMany({
		where: {
			dinozId,
			skillId
		}
	});
}

export async function updateAdminDinozItems(
	userId: string,
	dinozId: number,
	entries: {
		itemId: number;
	}[]
) {
	await getOwnedDinozOrThrow(userId, dinozId);

	await prisma.$transaction(async tx => {
		await tx.dinozItems.deleteMany({
			where: { dinozId }
		});

		const filtered = entries.filter(entry => entry.itemId > 0);

		if (filtered.length === 0) return;

		await tx.dinozItems.createMany({
			data: filtered.map(entry => ({
				dinozId,
				itemId: entry.itemId
			}))
		});
	});
}
