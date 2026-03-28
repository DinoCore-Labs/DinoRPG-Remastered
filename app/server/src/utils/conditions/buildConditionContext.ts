import { ConditionsContext } from '@dinorpg/core/models/conditions/conditionsContext.js';
import { dinozStatusKeyById } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { UserForConditionCheck } from '../user/userConditionCheck.js';

export type ConditionKeyMaps = {
	itemKeyById?: Partial<Record<number, string>>;
	skillKeyById?: Partial<Record<number, string>>;
	ingredientKeyById?: Partial<Record<number, string>>;
	rewardKeyById?: Partial<Record<number, string>>;
	placeKeyById?: Partial<Record<number, string>>;
	missionKeyById?: Partial<Record<number, string>>;
	getRaceKey?: (raceId: string | number | null | undefined) => string | undefined;
	getFriendKey?: (friendId: string | number | null | undefined) => string | undefined;
};

export type BuildConditionContextOptions = {
	now?: Date;
	dialogSeed?: number;
	sessionTags?: string[];
	currentTab?: string;

	activeFeatures?: string[];
	activeEvent?: string;
	activePromo?: string;
	activeWar?: string;
	activeConfigs?: string[];

	completedDungeonKeys?: string[];
	completedClanActionKeys?: string[];
	canFightMonsterKeys?: string[];

	rockDirectionIndex?: number;
};

function mapIdsToKeys(ids: number[], map?: Partial<Record<number, string>>): Set<string> {
	if (!map) return new Set();

	return new Set(ids.map(id => map[id]).filter((value): value is string => Boolean(value)));
}

function recordValue(
	source: Record<string, number> | { key: string; value: number }[] | undefined
): Record<string, number> {
	if (!source) return {};

	if (Array.isArray(source)) {
		return Object.fromEntries(source.map(entry => [entry.key, entry.value]));
	}

	return source;
}

function trackingToRecord(source: { stat: string; quantity: number }[] | undefined): Record<string, number> {
	if (!source) return {};

	return Object.fromEntries(source.map(entry => [entry.stat, entry.quantity]));
}

export function buildConditionContext(
	player: UserForConditionCheck,
	activeDinozId: number,
	maps: ConditionKeyMaps,
	options: BuildConditionContextOptions = {}
): ConditionsContext {
	const activeDinoz = player.dinoz.find(dinoz => dinoz.id === activeDinozId);

	if (!activeDinoz) {
		throw new ExpectedError(`No dinoz ${activeDinozId} found for condition context.`);
	}

	const statusIds = new Set(activeDinoz.status.map(status => status.statusId));
	const effectKeys = new Set(
		Array.from(statusIds)
			.map(id => dinozStatusKeyById[id])
			.filter((value): value is string => Boolean(value))
	);

	const skillKeys = mapIdsToKeys(
		activeDinoz.skills.map(skill => skill.skillId),
		maps.skillKeyById
	);

	const equipKeys = mapIdsToKeys(
		activeDinoz.items.map(item => item.itemId),
		maps.itemKeyById
	);

	const objectKeys = mapIdsToKeys(
		[...player.items.map(item => item.itemId), ...player.dinoz.flatMap(dinoz => dinoz.items.map(item => item.itemId))],
		maps.itemKeyById
	);

	const collectionKeys = mapIdsToKeys(
		player.rewards.map(reward => reward.rewardId),
		maps.rewardKeyById
	);

	const ingredientQuantities = Object.fromEntries(
		(player.ingredients ?? [])
			.map(ingredient => {
				const key = maps.ingredientKeyById?.[ingredient.ingredientId];
				return key ? ([key, ingredient.quantity] as const) : null;
			})
			.filter((entry): entry is readonly [string, number] => Boolean(entry))
	);

	const scenarios = Object.fromEntries(
		(player.quests ?? []).map(quest => [
			quest.questKey,
			{
				step: quest.progression,
				updatedAt: quest.updatedAt ?? null
			}
		])
	);

	const currentMission = activeDinoz.missions?.find(mission => !mission.isFinished);

	const finishedMissionKeys = new Set(
		(activeDinoz.missions ?? [])
			.filter(mission => mission.isFinished)
			.map(mission => maps.missionKeyById?.[mission.missionId])
			.filter((value): value is string => Boolean(value))
	);

	return {
		now: options.now ?? new Date(),

		session: {
			dialogSeed: options.dialogSeed ?? 0,
			tags: new Set(options.sessionTags ?? player.sessionTags ?? []),
			currentTab: options.currentTab ?? player.currentTab
		},

		dinoz: {
			id: activeDinoz.id,
			userId: player.id,
			level: activeDinoz.level,
			life: activeDinoz.life,
			placeKey: maps.placeKeyById?.[activeDinoz.placeId] ?? String(activeDinoz.placeId),
			statusIds,
			effectKeys,
			skillKeys,
			equipKeys,
			raceKey: maps.getRaceKey?.(activeDinoz.raceId),
			friendKey: maps.getFriendKey?.(activeDinoz.friendId) ?? null
		},

		user: {
			id: player.id,
			isAdmin: player.isAdmin ?? false,
			objectKeys,
			ingredientQuantities,
			collectionKeys,
			scenarios,
			uvars: trackingToRecord(player.tracking),
			gvars: recordValue(player.gvars),
			dinozCount: player.ranking?.dinozCount ?? player.dinoz.length,
			points: player.ranking?.points ?? 0
		},

		missions: {
			currentMissionKey: currentMission ? maps.missionKeyById?.[currentMission.missionId] : undefined,
			currentMissionStep: currentMission?.step,
			finishedMissionKeys
		},

		world: {
			activeFeatures: new Set((options.activeFeatures ?? []).map(value => value.toLowerCase())),
			activeEvent: options.activeEvent,
			activePromo: options.activePromo,
			activeWar: options.activeWar,
			activeConfigs: new Set((options.activeConfigs ?? []).map(value => value.toLowerCase())),
			completedDungeonKeys: new Set(options.completedDungeonKeys ?? []),
			completedClanActionKeys: new Set(options.completedClanActionKeys ?? []),
			canFightMonsterKeys: new Set(options.canFightMonsterKeys ?? []),
			rockDirectionIndex: options.rockDirectionIndex
		}
	};
}
