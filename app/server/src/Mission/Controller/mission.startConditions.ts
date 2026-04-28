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
	| { type: 'CAN_FIGHT'; monsterKey: MonsterKey }
	| { type: 'HAS_EFFECT'; effectKey: string };

type ParsedMissionStartConditionPart = {
	negated: boolean;
	condition: ParsedMissionStartCondition;
};

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
	const value = rawValue.trim();
	switch (type) {
		case 'mission':
			return {
				negated,
				condition: { type: 'MISSION_COMPLETED', missionKey: value }
			};
		case 'canfight':
			return {
				negated,
				condition: { type: 'CAN_FIGHT', monsterKey: value as MonsterKey }
			};
		case 'fx':
			return {
				negated,
				condition: { type: 'HAS_EFFECT', effectKey: value }
			};
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

function checkCanFightCondition(dinoz: OwnedDinozForMissionStart, monsterKey: MonsterKey): boolean {
	const monster = monsterByKey[monsterKey];
	if (!monster) {
		throw new Error(`Unknown monster key "${monsterKey}"`);
	}
	return dinoz.level >= monster.level;
}

function checkEffectCondition(dinoz: OwnedDinozForMissionStart, effectKey: string): boolean {
	const statusId = dinozStatusIdByKey[effectKey];
	if (!statusId) {
		throw new Error(`Unknown dinoz effect key "${effectKey}"`);
	}
	return dinoz.status.some(status => status.statusId === statusId);
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
			return checkCanFightCondition(params.dinoz, params.condition.monsterKey);
		case 'HAS_EFFECT':
			return checkEffectCondition(params.dinoz, params.condition.effectKey);
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
