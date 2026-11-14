import { MapZone } from '@dinorpg/core/models/enums/MapZone.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { getDinozMissionGroup } from '../../src/Mission/Controller/getDinozMission.controller.js';
import {
	advanceDinozMissionOnFightWon,
	advanceDinozMissionOnMove
} from '../../src/Mission/Controller/mission.progress.js';
import { completeMissionInteraction } from '../../src/Mission/Controller/missionInteract.controller.js';
import { startDinozMissionService } from '../../src/Mission/Controller/startDinozMission.controller.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(() => cleanDatabase());

async function setup(progress = 600, scenarioProgression = 8, level = 21) {
	const user = await createTestUser({ withTutorial: false });
	const clan = await prisma.clan.create({ data: { name: `ClinicMissions${user.name}`, leaderId: user.id, langs: [] } });
	await prisma.clanMember.create({ data: { userId: user.id, clanId: clan.id } });
	await prisma.user.update({ where: { id: user.id }, data: { clanId: clan.id } });
	await prisma.clanActionProgress.create({
		data: { clanId: clan.id, actionKey: 'hopita', progress, completedAt: progress >= 600 ? new Date() : null }
	});
	await prisma.userScenario.create({
		data: { userId: user.id, scenarioKey: 'clinik', progression: scenarioProgression }
	});
	const dinoz = await createTestDinoz({
		userId: user.id,
		placeId: PlaceEnum.CLINIQUE,
		canRename: false,
		level,
		life: 90
	});
	return { user, clan, dinoz };
}

function group(userId: string, dinozId: number) {
	return prisma.$transaction(tx => getDinozMissionGroup(tx, { userId, dinozId, group: 'infirmiere' }));
}
function start(userId: string, dinozId: number, missionKey: string) {
	return prisma.$transaction(tx => startDinozMissionService(tx, { userId, dinozId, missionKey }));
}
async function done(dinozId: number, missionKey: string) {
	await prisma.dinozMissions.create({ data: { dinozId, missionKey, isCompleted: true, progression: 2 } });
}

describe('Clinic mission group — access, progression and rewards', () => {
	it('lists all 7 missions but only unlocks the three ingredient deliveries initially', async () => {
		const { user, dinoz } = await setup();
		const response = await group(user.id, dinoz.id);
		expect(response.missions.map(mission => mission.key)).toEqual([
			'ingr1',
			'ingr2',
			'ingr3',
			'kill1',
			'kill2',
			'bless1',
			'bless2'
		]);
		expect(response.missions.slice(0, 3).map(mission => mission.status)).toEqual([
			'AVAILABLE',
			'AVAILABLE',
			'AVAILABLE'
		]);
		expect(response.missions.slice(3).every(mission => mission.status === 'LOCKED')).toBe(true);
	});

	it('refuses direct group and mission-start URLs before the clinic opens, after clan change or away from clinic', async () => {
		const { user, clan, dinoz } = await setup(599);
		await expect(group(user.id, dinoz.id)).rejects.toThrow();
		await expect(start(user.id, dinoz.id, 'ingr1')).rejects.toThrow();
		await prisma.clanActionProgress.update({
			where: { clanId_actionKey: { clanId: clan.id, actionKey: 'hopita' } },
			data: { progress: 600, completedAt: new Date() }
		});
		await prisma.userScenario.update({
			where: { scenarioKey_userId: { scenarioKey: 'clinik', userId: user.id } },
			data: { progression: 6 }
		});
		await expect(start(user.id, dinoz.id, 'ingr1')).rejects.toThrow();
		await prisma.userScenario.update({
			where: { scenarioKey_userId: { scenarioKey: 'clinik', userId: user.id } },
			data: { progression: 8 }
		});
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.DINOVILLE } });
		await expect(start(user.id, dinoz.id, 'ingr1')).rejects.toThrow();
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.CLINIQUE } });
		await prisma.clanMember.delete({ where: { userId: user.id } });
		await prisma.user.update({ where: { id: user.id }, data: { clanId: null } });
		await expect(group(user.id, dinoz.id)).rejects.toThrow();
	});

	it('consumes 10 Pelinae leaves once, then validates and gives exactly 10 XP', async () => {
		const { user, dinoz } = await setup();
		await prisma.userIngredients.create({
			data: { userId: user.id, ingredientId: Ingredient.FEUILLES_DE_PELINAE, quantity: 12 }
		});
		await start(user.id, dinoz.id, 'ingr1');
		await completeMissionInteraction({ userId: user.id, dinozId: dinoz.id, trigger: 'manual' });
		const remaining = await prisma.userIngredients.findFirst({
			where: { userId: user.id, ingredientId: Ingredient.FEUILLES_DE_PELINAE }
		});
		expect(remaining?.quantity).toBe(2);
		const finished = await completeMissionInteraction({ userId: user.id, dinozId: dinoz.id, trigger: 'manual' });
		expect(finished.completed).toBe(true);
		expect(finished.rewardModal?.rewards).toEqual([{ type: 'XP', value: 10 }]);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).experience).toBe(10);
		await expect(
			completeMissionInteraction({ userId: user.id, dinozId: dinoz.id, trigger: 'manual' })
		).rejects.toThrow();
	});

	it('unlocks Gropignon hunting only after all three deliveries; counts only zone 6 kills', async () => {
		const { user, dinoz } = await setup();
		for (const key of ['ingr1', 'ingr2', 'ingr3']) await done(dinoz.id, key);
		expect((await group(user.id, dinoz.id)).missions.find(m => m.key === 'kill1')?.canStart).toBe(true);
		await start(user.id, dinoz.id, 'kill1');
		const wrongZone = await prisma.$transaction(tx =>
			advanceDinozMissionOnFightWon(tx, {
				dinozId: dinoz.id,
				defeatedMonsterKeys: ['gropi'],
				zone: MapZone.DINOLAND
			})
		);
		expect(wrongZone).toBeNull();
		const some = await prisma.$transaction(tx =>
			advanceDinozMissionOnFightWon(tx, {
				dinozId: dinoz.id,
				defeatedMonsterKeys: ['gropi', 'gropi', 'coq'],
				zone: MapZone.DINOWEST
			})
		);
		expect(some?.tracking).toBe(2);
		await prisma.$transaction(tx =>
			advanceDinozMissionOnFightWon(tx, {
				dinozId: dinoz.id,
				defeatedMonsterKeys: Array.from({ length: 8 }, () => 'gropi' as const),
				zone: MapZone.DINOWEST
			})
		);
		const toValidate = await prisma.dinozMissions.findUniqueOrThrow({
			where: { missionKey_dinozId: { dinozId: dinoz.id, missionKey: 'kill1' } }
		});
		expect(toValidate.progression).toBe(1);
	});

	it('progresses the final rescue through the two original tourist conversations', async () => {
		const { user, dinoz } = await setup();
		await done(dinoz.id, 'bless1');
		await start(user.id, dinoz.id, 'bless2');
		await prisma.$transaction(tx =>
			advanceDinozMissionOnMove(tx, { dinozId: dinoz.id, place: PlaceEnum.REPAIRE_DU_VENERABLE })
		);
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.REPAIRE_DU_VENERABLE } });
		await completeMissionInteraction({ userId: user.id, dinozId: dinoz.id, trigger: 'manual' });
		await prisma.$transaction(tx => advanceDinozMissionOnMove(tx, { dinozId: dinoz.id, place: PlaceEnum.CLINIQUE }));
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.CLINIQUE } });
		await completeMissionInteraction({ userId: user.id, dinozId: dinoz.id, trigger: 'manual' });
		const last = await completeMissionInteraction({ userId: user.id, dinozId: dinoz.id, trigger: 'manual' });
		expect(last.completed).toBe(true);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).experience).toBe(20);
	});
});
