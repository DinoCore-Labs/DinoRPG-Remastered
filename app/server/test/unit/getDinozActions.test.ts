import { Action, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { describe, expect, it, vi } from 'vitest';

import { getAvailableActions } from '../../src/Dinoz/Service/getDinozActions.service.js';

vi.mock('../../src/Dialog/Service/dialog.service.js', () => ({
	listAvailableDialogs: vi.fn().mockResolvedValue([])
}));

vi.mock('../../src/prisma.js', () => ({
	prisma: {
		mtDungeonRun: {
			findFirst: vi.fn().mockResolvedValue(null)
		},
		dinozConcentration: {
			findUnique: vi.fn().mockResolvedValue(null)
		},
		devourerControl: {
			findFirst: vi.fn().mockResolvedValue(null),
			findUnique: vi.fn().mockResolvedValue(null)
		},
		dinoz: {
			findMany: vi.fn().mockResolvedValue([])
		},
		user: {
			findUnique: vi.fn().mockResolvedValue(null)
		},
		secret: {
			findFirst: vi.fn().mockResolvedValue({ value: String(PlaceEnum.NOWHERE) })
		}
	}
}));

describe('getAvailableActions - follower actions ordering', () => {
	it('places follower gather actions after leader actions', async () => {
		const follower: any = {
			id: 2,
			name: 'FollowerDinoz',
			placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
			leaderId: 1,
			state: null,
			life: 50,
			maxLife: 100,
			level: 5,
			remaining: 1,
			fight: true,
			gather: true,
			nbrUpFire: 1,
			nbrUpWood: 1,
			nbrUpWater: 1,
			nbrUpLightning: 1,
			nbrUpAir: 1,
			raceId: 1,
			skills: [{ skillId: Skill.CUEILLETTE, state: 'unlocked' }],
			status: [],
			items: [],
			missions: [],
			followers: []
		};

		const leader: any = {
			id: 1,
			userId: 'user-1',
			placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE,
			leaderId: null,
			state: null,
			life: 100,
			maxLife: 100,
			experience: 10,
			level: 5,
			remaining: 1,
			fight: true,
			gather: false,
			nbrUpFire: 1,
			nbrUpWood: 1,
			nbrUpWater: 1,
			nbrUpLightning: 1,
			nbrUpAir: 1,
			raceId: 1,
			skills: [],
			status: [],
			items: [],
			missions: [],
			followers: [follower]
		};

		const user: any = {
			id: 'user-1',
			name: 'Master',
			gold: 1000,
			isAdmin: false,
			items: [],
			rewards: [],
			ingredients: [],
			scenarios: [],
			ranking: { dinozCount: 2, points: 42 },
			tracking: [],
			gvars: [],
			sessionTags: [],
			epics: [],
			flags: [],
			dinoz: [leader, follower]
		};

		const actions = await getAvailableActions(
			leader,
			user,
			{},
			{
				itinerantPlaceId: PlaceEnum.NOWHERE,
				followableDinozCandidates: []
			}
		);

		// Follower gather action should exist
		const followerGatherAction = actions.find(a => a.forDinoz === 2);
		expect(followerGatherAction).toBeDefined();

		// Leader's own actions (FIGHT, DISBAND, etc.) should come before follower action
		const followerActionIndex = actions.findIndex(a => a.forDinoz === 2);
		const fightIndex = actions.findIndex(a => a.name === actionList[Action.FIGHT].name);
		const disbandIndex = actions.findIndex(a => a.name === actionList[Action.DISBAND].name);

		expect(fightIndex).toBeGreaterThanOrEqual(0);
		expect(disbandIndex).toBeGreaterThanOrEqual(0);
		expect(followerActionIndex).toBeGreaterThan(fightIndex);
		expect(followerActionIndex).toBeGreaterThan(disbandIndex);
		expect(followerActionIndex).toBe(actions.length - 1);
	});

	it('places follower mission actions after leader actions and before follower gather actions', async () => {
		const follower: any = {
			id: 2,
			name: 'FollowerDinoz',
			placeId: PlaceEnum.PORT_DE_PRECHE,
			leaderId: 1,
			state: null,
			life: 50,
			maxLife: 100,
			level: 5,
			remaining: 1,
			fight: true,
			gather: true,
			nbrUpFire: 1,
			nbrUpWood: 1,
			nbrUpWater: 1,
			nbrUpLightning: 1,
			nbrUpAir: 1,
			raceId: 1,
			skills: [{ skillId: Skill.PECHEUR_DE_PETIT_POISSON, state: 'unlocked' }],
			status: [],
			items: [],
			missions: [
				{
					id: 10,
					missionKey: 'fish',
					progression: 1, // TALK goal at PORT_DE_PRECHE
					tracking: 0,
					isCompleted: false
				}
			],
			followers: []
		};

		const leader: any = {
			id: 1,
			userId: 'user-1',
			placeId: PlaceEnum.PORT_DE_PRECHE,
			leaderId: null,
			state: null,
			life: 100,
			maxLife: 100,
			experience: 10,
			level: 5,
			remaining: 1,
			fight: true,
			gather: false,
			nbrUpFire: 1,
			nbrUpWood: 1,
			nbrUpWater: 1,
			nbrUpLightning: 1,
			nbrUpAir: 1,
			raceId: 1,
			skills: [],
			status: [],
			items: [],
			missions: [],
			followers: [follower]
		};

		const user: any = {
			id: 'user-1',
			name: 'Master',
			gold: 1000,
			isAdmin: false,
			items: [],
			rewards: [],
			ingredients: [],
			scenarios: [],
			ranking: { dinozCount: 2, points: 42 },
			tracking: [],
			gvars: [],
			sessionTags: [],
			epics: [],
			flags: [],
			dinoz: [leader, follower]
		};

		const actions = await getAvailableActions(
			leader,
			user,
			{},
			{
				itinerantPlaceId: PlaceEnum.NOWHERE,
				followableDinozCandidates: []
			}
		);

		const followerActions = actions.filter(a => a.forDinoz === 2);
		expect(followerActions.length).toBeGreaterThanOrEqual(1);

		const missionAction = followerActions.find(a => a.name === actionList[Action.MISSION].name);
		expect(missionAction).toBeDefined();
		expect(missionAction?.forDinoz).toBe(2);

		const leaderFightIndex = actions.findIndex(a => a.name === actionList[Action.FIGHT].name && !a.forDinoz);
		const followerMissionIndex = actions.findIndex(a => a.name === actionList[Action.MISSION].name && a.forDinoz === 2);
		expect(followerMissionIndex).toBeGreaterThan(leaderFightIndex);
	});
});
