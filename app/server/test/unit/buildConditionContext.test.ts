import type { ConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { describe, expect, it } from 'vitest';

import { buildConditionContext } from '../../src/utils/conditions/buildConditionContext.js';
import type { UserForConditionCheck } from '../../src/utils/user/userConditionCheck.js';

const maps: ConditionKeyMaps = {
	itemKeyById: {
		10: 'potion_irma',
		20: 'active_equipment',
		21: 'other_equipment'
	},
	skillKeyById: {
		30: 'charge',
		31: 'other_skill'
	},
	ingredientKeyById: {
		40: 'merou_lujidane'
	},
	rewardKeyById: {
		50: 'rocky'
	},
	placeKeyById: {
		60: 'dinoville',
		61: 'dinoplage'
	},
	getRaceKey: raceId => {
		if (raceId === 1) {
			return 'moueffe';
		}
		if (raceId === 2) {
			return 'pigmou';
		}
		return undefined;
	},
	getFriendKey: friendId => {
		if (friendId === 2) {
			return 'guide_michel';
		}
		return undefined;
	}
};

function createPlayer(): UserForConditionCheck {
	return {
		id: '00000000-0000-0000-0000-000000000001',
		isAdmin: false,
		items: [
			{
				itemId: 10,
				quantity: 2
			}
		],
		rewards: [
			{
				rewardId: 50
			}
		],
		ingredients: [
			{
				ingredientId: 40,
				quantity: 5
			}
		],
		scenarios: [
			{
				scenarioKey: 'tutorial',
				progression: 3,
				tracking: 1,
				updatedAt: new Date('2026-09-20T10:00:00Z')
			}
		],
		ranking: {
			dinozCount: 2,
			points: 42
		},
		tracking: [
			{
				stat: 'GET_DINOZ',
				quantity: 3
			}
		],
		gvars: [
			{
				key: 'event_progress',
				value: 7
			}
		],
		sessionTags: ['dialog-ready'],
		currentTab: 'main',
		dinoz: [
			{
				id: 1,
				level: 5,
				life: 80,
				placeId: 60,
				raceId: 1,
				friendId: 2,
				status: [
					{
						statusId: DinozStatusId.BUOY
					}
				],
				items: [
					{
						itemId: 20
					}
				],
				skills: [
					{
						skillId: 30
					}
				],
				missions: [
					{
						missionKey: 'current_mission',
						progression: 2,
						tracking: 0,
						isCompleted: false
					},
					{
						missionKey: 'finished_mission',
						progression: 3,
						tracking: 0,
						isCompleted: true
					}
				]
			},
			{
				id: 2,
				level: 3,
				life: 50,
				placeId: 61,
				raceId: 2,
				friendId: null,
				status: [
					{
						statusId: DinozStatusId.LANTERN
					}
				],
				items: [
					{
						itemId: 21
					}
				],
				skills: [
					{
						skillId: 31
					}
				],
				missions: []
			}
		]
	};
}

describe('buildConditionContext', () => {
	it('builds the active Dinoz condition context', () => {
		const player = createPlayer();
		const context = buildConditionContext(player, 1, maps);
		expect(context.dinoz.id).toBe(1);
		expect(context.dinoz.userId).toBe(player.id);
		expect(context.dinoz.level).toBe(5);
		expect(context.dinoz.life).toBe(80);
		expect(context.dinoz.placeKey).toBe('dinoville');
		expect(context.dinoz.raceKey).toBe('moueffe');
		expect(context.dinoz.friendKey).toBe('guide_michel');
		expect(context.dinoz.skillKeys).toEqual(new Set(['charge']));
		expect(context.dinoz.equipKeys).toEqual(new Set(['active_equipment']));
		expect(context.dinoz.statusIds).toContain(DinozStatusId.BUOY);
	});

	it('builds player inventory and progression data', () => {
		const context = buildConditionContext(createPlayer(), 1, maps);
		expect(context.user.objectKeys).toEqual(new Set(['potion_irma', 'active_equipment', 'other_equipment']));
		expect(context.user.ingredientQuantities).toEqual({
			merou_lujidane: 5
		});
		expect(context.user.collectionKeys).toEqual(new Set(['rocky']));
		expect(context.user.scenarios.tutorial).toMatchObject({
			progression: 3
		});
		expect(context.user.uvars).toEqual({
			GET_DINOZ: 3
		});
		expect(context.user.gvars).toEqual({
			event_progress: 7
		});
		expect(context.user.dinozCount).toBe(2);
		expect(context.user.points).toBe(42);
	});

	it('builds the current and completed mission state', () => {
		const context = buildConditionContext(createPlayer(), 1, maps);
		expect(context.missions.currentMissionKey).toBe('current_mission');
		expect(context.missions.currentMissionStep).toBe(2);
		expect(context.missions.finishedMissionKeys).toEqual(new Set(['finished_mission']));
	});

	it('collects statuses from all player Dinoz for userEffect conditions', () => {
		const context = buildConditionContext(createPlayer(), 1, maps);
		expect(context.user.allDinozStatusIds).toEqual(new Set([DinozStatusId.BUOY, DinozStatusId.LANTERN]));
	});

	it('maps session and world options', () => {
		const now = new Date('2026-09-20T12:00:00Z');
		const context = buildConditionContext(createPlayer(), 1, maps, {
			now,
			dialogSeed: 12345,
			sessionTags: ['Tutorial'],
			currentTab: 'missions',
			activeFeatures: ['STARQUEST'],
			activeConfigs: ['SpecialEvent'],
			activeEvent: 'halloween',
			activePromo: 'summer',
			activeWar: 'war1',
			completedDungeonKeys: ['volcano'],
			completedClanActionKeys: ['clan_action'],
			canFightMonsterKeys: ['goblin'],
			rockDirectionIndex: 3
		});
		expect(context.now).toEqual(now);
		expect(context.session.dialogSeed).toBe(12345);
		expect(context.session.tags).toEqual(new Set(['Tutorial']));
		expect(context.session.currentTab).toBe('missions');
		expect(context.world.activeFeatures).toEqual(new Set(['starquest']));
		expect(context.world.activeConfigs).toEqual(new Set(['specialevent']));
		expect(context.world.activeEvent).toBe('halloween');
		expect(context.world.activePromo).toBe('summer');
		expect(context.world.activeWar).toBe('war1');
		expect(context.world.completedDungeonKeys).toContain('volcano');
		expect(context.world.completedClanActionKeys).toContain('clan_action');
		expect(context.world.canFightMonsterKeys).toContain('goblin');
		expect(context.world.rockDirectionIndex).toBe(3);
	});

	it('falls back to the Dinoz array when ranking is missing', () => {
		const player = createPlayer();
		player.ranking = null;
		const context = buildConditionContext(player, 1, maps);
		expect(context.user.dinozCount).toBe(2);
		expect(context.user.points).toBe(0);
	});

	it('rejects an unknown active Dinoz', () => {
		expect(() => buildConditionContext(createPlayer(), 999, maps)).toThrow('No dinoz 999 found for condition context.');
	});
});
