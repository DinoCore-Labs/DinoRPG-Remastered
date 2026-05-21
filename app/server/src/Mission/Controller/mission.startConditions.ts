import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import type { MissionConditionSource } from '@dinorpg/core/models/missions/missionCondition.js';
import type { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { Prisma } from '../../../../prisma/client.js';

type MissionTransaction = Prisma.TransactionClient;

type OwnedDinozForMissionStart = {
	id: number;
	level: number;
	status: {
		statusId: number;
	}[];
};

type ParsedMissionStartCondition =
	| { type: 'MISSION_COMPLETED'; missionKey: string }
	| { type: 'CAN_FIGHT'; monsterKey: MonsterKey; requiredLevel?: number }
	| { type: 'HAS_EFFECT'; effectKey: string }
	| { type: 'LEVEL'; level: number };

type ParsedMissionStartConditionPart = {
	negated: boolean;
	condition: ParsedMissionStartCondition;
};

function parseCanFightRequiredLevel(rawLevel: string | undefined, part: string): number | undefined {
	if (!rawLevel) {
		return undefined;
	}
	const requiredLevel = Number(rawLevel);
	if (!Number.isInteger(requiredLevel) || requiredLevel <= 0) {
		throw new Error(`Invalid canfight required level "${rawLevel}" in mission condition "${part}"`);
	}
	return requiredLevel;
}

function parseMissionStartConditionPart(part: string): ParsedMissionStartConditionPart {
	const trimmedPart = part.trim();
	const negated = trimmedPart.startsWith('!');
	const source = negated ? trimmedPart.slice(1).trim() : trimmedPart;
	const match = /^([a-zA-Z_]+)\(([^()]+)\)$/.exec(source);
	if (!match) {
		throw new Error(`Unsupported mission condition "${part}"`);
	}
	const [, rawType, rawValue] = match;
	const type = rawType.trim();
	const args = rawValue
		.split(',')
		.map(arg => arg.trim())
		.filter(Boolean);
	switch (type) {
		case 'mission': {
			const [missionKey] = args;
			if (!missionKey || args.length !== 1) {
				throw new Error(`Invalid mission condition "${part}"`);
			}
			return {
				negated,
				condition: { type: 'MISSION_COMPLETED', missionKey }
			};
		}
		case 'canfight': {
			const [monsterKey, rawRequiredLevel] = args;
			if (!monsterKey || args.length > 2) {
				throw new Error(`Invalid canfight condition "${part}"`);
			}
			return {
				negated,
				condition: {
					type: 'CAN_FIGHT',
					monsterKey: monsterKey as MonsterKey,
					requiredLevel: parseCanFightRequiredLevel(rawRequiredLevel, part)
				}
			};
		}
		case 'fx': {
			const [effectKey] = args;
			if (!effectKey || args.length !== 1) {
				throw new Error(`Invalid fx condition "${part}"`);
			}
			return {
				negated,
				condition: { type: 'HAS_EFFECT', effectKey }
			};
		}
		case 'level': {
			const [rawLevel] = args;
			const level = Number(rawLevel);
			if (!rawLevel || args.length !== 1) {
				throw new Error(`Invalid level condition "${part}"`);
			}
			return {
				negated,
				condition: {
					type: 'LEVEL',
					level
				}
			};
		}
		default:
			throw new Error(`Unsupported mission condition type "${type}"`);
	}
}

function parseMissionStartConditionSource(source: MissionConditionSource): ParsedMissionStartConditionPart[][] {
	return source
		.split('|')
		.map(orPart =>
			orPart
				.split('+')
				.map(andPart => andPart.trim())
				.filter(Boolean)
				.map(parseMissionStartConditionPart)
		)
		.filter(group => group.length > 0);
}

async function checkMissionCompletedCondition(
	tx: MissionTransaction,
	dinozId: number,
	missionKey: string
): Promise<boolean> {
	const mission = await tx.dinozMissions.findUnique({
		where: {
			missionKey_dinozId: {
				missionKey,
				dinozId
			}
		},
		select: {
			isCompleted: true
		}
	});
	return mission?.isCompleted === true;
}

function checkCanFightCondition(
	dinoz: OwnedDinozForMissionStart,
	monsterKey: MonsterKey,
	requiredLevel?: number
): boolean {
	const monster = monsterByKey[monsterKey];
	if (!monster) {
		throw new Error(`Unknown monster key "${monsterKey}"`);
	}
	return dinoz.level >= (requiredLevel ?? monster.level);
}

function checkEffectCondition(dinoz: OwnedDinozForMissionStart, effectKey: string): boolean {
	const statusId = dinozStatusIdByKey[effectKey];
	if (!statusId) {
		throw new Error(`Unknown dinoz effect key "${effectKey}"`);
	}
	return dinoz.status.some(status => status.statusId === statusId);
}

function checkLevelCondition(dinoz: OwnedDinozForMissionStart, level: number): boolean {
	return dinoz.level >= level;
}

async function checkSingleMissionStartCondition(
	tx: MissionTransaction,
	params: {
		dinoz: OwnedDinozForMissionStart;
		condition: ParsedMissionStartCondition;
	}
): Promise<boolean> {
	switch (params.condition.type) {
		case 'MISSION_COMPLETED':
			return checkMissionCompletedCondition(tx, params.dinoz.id, params.condition.missionKey);
		case 'CAN_FIGHT':
			return checkCanFightCondition(params.dinoz, params.condition.monsterKey, params.condition.requiredLevel);
		case 'HAS_EFFECT':
			return checkEffectCondition(params.dinoz, params.condition.effectKey);
		case 'LEVEL':
			return checkLevelCondition(params.dinoz, params.condition.level);
	}
}

export async function checkMissionStartCondition(
	tx: MissionTransaction,
	params: {
		dinoz: OwnedDinozForMissionStart;
		condition?: MissionConditionSource | null;
	}
): Promise<boolean> {
	if (!params.condition) {
		return true;
	}
	const conditionGroups = parseMissionStartConditionSource(params.condition);
	for (const group of conditionGroups) {
		let groupIsValid = true;
		for (const parsedCondition of group) {
			const result = await checkSingleMissionStartCondition(tx, {
				dinoz: params.dinoz,
				condition: parsedCondition.condition
			});
			const finalResult = parsedCondition.negated ? !result : result;
			if (!finalResult) {
				groupIsValid = false;
				break;
			}
		}
		if (groupIsValid) {
			return true;
		}
	}
	return false;
}

export async function assertMissionStartCondition(
	tx: MissionTransaction,
	params: {
		dinoz: OwnedDinozForMissionStart;
		condition?: MissionConditionSource | null;
	}
) {
	const isAllowed = await checkMissionStartCondition(tx, params);
	if (!isAllowed) {
		throw new ExpectedError(`Mission start conditions are not satisfied`);
	}
}
