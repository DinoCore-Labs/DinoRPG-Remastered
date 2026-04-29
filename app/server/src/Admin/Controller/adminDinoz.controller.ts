import type { AdminDinozDetails, AdminDinozMissionEntry } from '@dinorpg/core/models/admin/adminDinoz.js';
import { UpdateAdminDinozMissionPayload } from '@dinorpg/core/models/admin/adminDinozPayloads.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozState, Prisma } from '../../../../prisma/index.js';
import { addSkillToDinozWithEffects } from '../../Level/Service/learnSkill.service.js';
import { prisma } from '../../prisma.js';

const missionDefinitionByKey = new Map<string, MissionDefinition>(missionList.map(mission => [mission.key, mission]));

function getMissionDefinitionOrThrow(missionKey: string): MissionDefinition {
	const definition = missionDefinitionByKey.get(missionKey);
	if (!definition) {
		throw new ExpectedError('unknownMission', {
			params: {
				missionKey
			}
		});
	}
	return definition;
}

function toAdminMissionEntry(
	mission: {
		id: number;
		missionKey: string;
		progression: number;
		tracking: number;
		state: unknown;
		isCompleted: boolean;
		startedAt: Date;
		createdAt: Date;
		updatedAt: Date;
	},
	isCurrent: boolean
): AdminDinozMissionEntry {
	const definition = missionDefinitionByKey.get(mission.missionKey);
	const currentGoalIndex =
		definition && !mission.isCompleted && mission.progression >= 0 && mission.progression < definition.goals.length
			? mission.progression
			: null;
	return {
		id: mission.id,
		missionKey: mission.missionKey,
		group: definition?.group ?? null,
		nameKey: definition?.nameKey ?? null,
		beginKey: definition?.beginKey ?? null,
		endKey: definition?.endKey ?? null,
		progression: mission.progression,
		tracking: mission.tracking,
		goalCount: definition?.goals.length ?? null,
		isCompleted: mission.isCompleted,
		isCurrent,
		state: (mission.state ?? null) as AdminDinozMissionEntry['state'],
		currentGoalIndex,
		currentGoal: currentGoalIndex !== null ? (definition?.goals[currentGoalIndex] ?? null) : null,
		startedAt: mission.startedAt.toISOString(),
		createdAt: mission.createdAt.toISOString(),
		updatedAt: mission.updatedAt.toISOString()
	};
}

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
			unlockableSkills: {
				select: {
					id: true,
					skillId: true
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
			},
			missions: {
				orderBy: [{ isCompleted: 'asc' }, { updatedAt: 'desc' }]
			}
		}
	});
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', {
			params: {
				dinozId
			}
		});
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
	const currentMissionId = dinoz.missions.find(mission => !mission.isCompleted)?.id ?? null;
	const missions = dinoz.missions.map(mission => toAdminMissionEntry(mission, mission.id === currentMissionId));
	const currentMission = missions.find(mission => mission.isCurrent) ?? null;
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
		unlockableSkills: dinoz.unlockableSkills,
		items: dinoz.items,
		followers: dinoz.followers,
		leaderOptions,
		missions,
		currentMission
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
		throw new ExpectedError('lifeCannotExceedMaxLife');
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
		throw new ExpectedError('cannotFollowSelf');
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
			throw new ExpectedError('invalidLeader');
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
		throw new ExpectedError('skillNotFound');
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

export async function addAdminDinozUnlockableSkill(userId: string, dinozId: number, skillId: number) {
	await getOwnedDinozOrThrow(userId, dinozId);
	const existing = await prisma.dinozSkillsUnlockable.findFirst({
		where: {
			dinozId,
			skillId
		},
		select: { id: true }
	});

	if (existing) {
		return;
	}
	await prisma.dinozSkillsUnlockable.create({
		data: {
			dinozId,
			skillId
		}
	});
}

export async function removeAdminDinozUnlockableSkill(userId: string, dinozId: number, skillId: number) {
	await getOwnedDinozOrThrow(userId, dinozId);
	await prisma.dinozSkillsUnlockable.deleteMany({
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

export async function updateAdminDinozMission(
	userId: string,
	dinozId: number,
	missionKey: string,
	payload: UpdateAdminDinozMissionPayload
) {
	await getOwnedDinozOrThrow(userId, dinozId);
	const definition = getMissionDefinitionOrThrow(missionKey);
	if (!Number.isInteger(payload.progression) || payload.progression < 0) {
		throw new ExpectedError('missionProgressionMustBePositiveInteger');
	}
	if (!Number.isInteger(payload.tracking) || payload.tracking < 0) {
		throw new ExpectedError('missionTrackingMustBePositiveInteger');
	}
	if (!payload.isCompleted && payload.progression >= definition.goals.length) {
		throw new ExpectedError('missionProgressionOutOfRange');
	}
	const existingMission = await prisma.dinozMissions.findUnique({
		where: {
			missionKey_dinozId: {
				missionKey,
				dinozId
			}
		}
	});
	if (!existingMission) {
		throw new ExpectedError('dinozMissionNotFound', {
			params: {
				missionKey
			}
		});
	}
	const missionState: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =
		payload.state === null ? Prisma.JsonNull : (payload.state as Prisma.InputJsonValue);
	await prisma.dinozMissions.update({
		where: {
			missionKey_dinozId: {
				missionKey,
				dinozId
			}
		},
		data: {
			progression: payload.isCompleted ? definition.goals.length : payload.progression,
			tracking: payload.tracking,
			state: missionState,
			isCompleted: payload.isCompleted
		}
	});
}

export async function makeAdminDinozMissionReplayable(userId: string, dinozId: number, missionKey: string) {
	await getOwnedDinozOrThrow(userId, dinozId);
	getMissionDefinitionOrThrow(missionKey);
	const existingMission = await prisma.dinozMissions.findUnique({
		where: {
			missionKey_dinozId: {
				missionKey,
				dinozId
			}
		}
	});
	if (!existingMission) {
		throw new ExpectedError('dinozMissionNotFound', {
			params: {
				missionKey
			}
		});
	}
	if (!existingMission.isCompleted) {
		throw new ExpectedError('onlyCompletedMissionsCanBeReplayable');
	}
	await prisma.dinozMissions.delete({
		where: {
			missionKey_dinozId: {
				missionKey,
				dinozId
			}
		}
	});
}
