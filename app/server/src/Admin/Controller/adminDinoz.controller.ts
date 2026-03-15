import type { AdminDinozDetails, UpdateAdminDinozBody } from '@dinorpg/core/models/admin/adminDinoz.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { prisma } from '../../prisma.js';

function mapAdminDinoz(dinoz: {
	id: number;
	userId: string;
	name: string;
	canRename: boolean;
	raceId: number;
	display: string;
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
	placeId: number;
	remaining: number;
	order: number | null;
	seed: string;
	state: string | null;
	stateTimer: Date | null;
	fight: boolean;
	gather: boolean;
	leaderId: number | null;
	createdDate: Date;
	updatedDate: Date;
	user: { name: string | null };
	status: { id: number; statusId: number }[];
	skills: { id: number; skillId: number; state: boolean }[];
	items: { id: number; itemId: number }[];
	followers: { id: number; name: string; level: number }[];
}): AdminDinozDetails {
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
		order: dinoz.order,

		seed: dinoz.seed,

		state: dinoz.state as AdminDinozDetails['state'],
		stateTimer: dinoz.stateTimer?.toISOString() ?? null,

		fight: dinoz.fight,
		gather: dinoz.gather,

		leaderId: dinoz.leaderId,

		createdDate: dinoz.createdDate.toISOString(),
		updatedDate: dinoz.updatedDate.toISOString(),

		status: dinoz.status,
		skills: dinoz.skills,
		items: dinoz.items,
		followers: dinoz.followers
	};
}

export async function getAdminDinozById(playerId: string, dinozId: number): Promise<AdminDinozDetails> {
	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId: playerId
		},
		select: {
			id: true,
			userId: true,
			name: true,
			canRename: true,
			raceId: true,
			display: true,
			level: true,
			life: true,
			maxLife: true,
			experience: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			nextUpElementId: true,
			nextUpAltElementId: true,
			placeId: true,
			remaining: true,
			order: true,
			seed: true,
			state: true,
			stateTimer: true,
			fight: true,
			gather: true,
			leaderId: true,
			createdDate: true,
			updatedDate: true,
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
		throw new ExpectedError(`Dinoz ${dinozId} not found for player ${playerId}.`);
	}

	return mapAdminDinoz(dinoz);
}

export async function updateAdminDinoz(dinozId: number, body: UpdateAdminDinozBody): Promise<AdminDinozDetails> {
	const existing = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: { id: true, userId: true }
	});

	if (!existing) {
		throw new ExpectedError(`Dinoz ${dinozId} not found.`);
	}

	if (body.life !== undefined && body.maxLife !== undefined && body.life > body.maxLife) {
		throw new ExpectedError('life cannot be greater than maxLife.');
	}

	const updated = await prisma.dinoz.update({
		where: { id: dinozId },
		data: {
			name: body.name,
			canRename: body.canRename,
			raceId: body.raceId,
			display: body.display,

			level: body.level,
			life: body.life,
			maxLife: body.maxLife,
			experience: body.experience,

			nbrUpFire: body.nbrUpFire,
			nbrUpWood: body.nbrUpWood,
			nbrUpWater: body.nbrUpWater,
			nbrUpLightning: body.nbrUpLightning,
			nbrUpAir: body.nbrUpAir,

			nextUpElementId: body.nextUpElementId,
			nextUpAltElementId: body.nextUpAltElementId,

			placeId: body.placeId,
			remaining: body.remaining,
			order: body.order,

			seed: body.seed,

			state: body.state ?? undefined,
			stateTimer: body.stateTimer ? new Date(body.stateTimer) : body.stateTimer,

			fight: body.fight,
			gather: body.gather,

			leaderId: body.leaderId
		},
		select: {
			id: true,
			userId: true,
			name: true,
			canRename: true,
			raceId: true,
			display: true,
			level: true,
			life: true,
			maxLife: true,
			experience: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			nextUpElementId: true,
			nextUpAltElementId: true,
			placeId: true,
			remaining: true,
			order: true,
			seed: true,
			state: true,
			stateTimer: true,
			fight: true,
			gather: true,
			leaderId: true,
			createdDate: true,
			updatedDate: true,
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

	return mapAdminDinoz(updated);
}
