import type { MissionConditionSource } from '@dinorpg/core/models/missions/missionCondition.js';
import type { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { Prisma } from '../../../../prisma/client.js';

type MissionTransaction = Prisma.TransactionClient;

type OwnedDinozForMissionStart = {
	id: number;
	level: number;
};

type ParsedMissionStartCondition =
	| {
			type: 'MISSION_COMPLETED';
			missionKey: string;
	  }
	| {
			type: 'CAN_FIGHT';
			monsterKey: MonsterKey;
	  };

function parseMissionStartConditionPart(part: string): ParsedMissionStartCondition {
	const match = /^([a-zA-Z_]+)\(([^()]+)\)$/.exec(part.trim());

	if (!match) {
		throw new Error(`Unsupported mission condition "${part}"`);
	}

	const [, rawType, rawValue] = match;
	const type = rawType.trim();
	const value = rawValue.trim();

	switch (type) {
		case 'mission':
			return {
				type: 'MISSION_COMPLETED',
				missionKey: value
			};

		case 'canfight':
			return {
				type: 'CAN_FIGHT',
				monsterKey: value as MonsterKey
			};

		default:
			throw new Error(`Unsupported mission condition type "${type}"`);
	}
}

function parseMissionStartConditionSource(source: MissionConditionSource): ParsedMissionStartCondition[] {
	return source
		.split('+')
		.map(part => part.trim())
		.filter(Boolean)
		.map(parseMissionStartConditionPart);
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

export async function assertMissionStartCondition(
	tx: MissionTransaction,
	params: {
		dinoz: OwnedDinozForMissionStart;
		condition?: MissionConditionSource | null;
	}
) {
	if (!params.condition) {
		return;
	}

	const parsedConditions = parseMissionStartConditionSource(params.condition);

	for (const condition of parsedConditions) {
		switch (condition.type) {
			case 'MISSION_COMPLETED': {
				const isCompleted = await checkMissionCompletedCondition(tx, params.dinoz.id, condition.missionKey);

				if (!isCompleted) {
					throw new ExpectedError(`Mission "${condition.missionKey}" must be completed before starting this mission`);
				}

				break;
			}

			case 'CAN_FIGHT': {
				const canFight = checkCanFightCondition(params.dinoz, condition.monsterKey);

				if (!canFight) {
					throw new ExpectedError(
						`Dinoz "${params.dinoz.id}" cannot start a mission requiring "${condition.monsterKey}"`
					);
				}

				break;
			}
		}
	}
}
