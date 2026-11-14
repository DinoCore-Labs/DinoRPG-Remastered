import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { getAvailableClanActionsForDinoz } from '../../src/Clan/Service/clanActionDinoz.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function createClanWithMember(userId: string) {
	const clan = await prisma.clan.create({
		data: { name: 'Chantier de la clinique', leaderId: userId, langs: [] }
	});
	await prisma.clanMember.create({ data: { clanId: clan.id, userId } });
	await prisma.user.update({ where: { id: userId }, data: { clanId: clan.id } });
	return clan;
}

async function setClinicStep(userId: string, progression: number) {
	await prisma.userScenario.upsert({
		where: { scenarioKey_userId: { scenarioKey: 'clinik', userId } },
		create: { scenarioKey: 'clinik', userId, progression },
		update: { progression }
	});
}

describe('Actions de clan sur la fiche Dinoz', () => {
	it('ne propose aucun chantier aux joueurs sans clan', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setClinicStep(user.id, 6);
		expect(await getAvailableClanActionsForDinoz(user.id, PlaceEnum.CLINIQUE)).toEqual([]);
	});

	it('ne propose pas la clinique avant la phase 6, ni dans un autre lieu', async () => {
		const user = await createTestUser({ withTutorial: false });
		await createClanWithMember(user.id);
		await setClinicStep(user.id, 5);
		expect(await getAvailableClanActionsForDinoz(user.id, PlaceEnum.CLINIQUE)).toEqual([]);
		await setClinicStep(user.id, 6);
		expect(await getAvailableClanActionsForDinoz(user.id, PlaceEnum.DINOVILLE)).toEqual([]);
	});

	it('affiche la progression de la clinique du clan avec le bon identifiant', async () => {
		const user = await createTestUser({ withTutorial: false });
		const clan = await createClanWithMember(user.id);
		await setClinicStep(user.id, 6);
		await prisma.clanActionProgress.create({
			data: { clanId: clan.id, actionKey: 'hopita', progress: 237 }
		});
		const actions = await getAvailableClanActionsForDinoz(user.id, PlaceEnum.CLINIQUE);
		expect(actions).toHaveLength(1);
		expect(actions[0]).toMatchObject({
			name: 'clan_action',
			prop: 'hopita',
			clanAction: {
				clanId: clan.id,
				actionKey: 'hopita',
				progress: 237,
				total: 600,
				percentage: 39,
				completed: false
			}
		});
	});

	it('conserve un affichage de chantier terminé et suit le clan actuel', async () => {
		const user = await createTestUser({ withTutorial: false });
		const oldClan = await createClanWithMember(user.id);
		await setClinicStep(user.id, 8);
		await prisma.clanActionProgress.create({
			data: { clanId: oldClan.id, actionKey: 'hopita', progress: 600, completedAt: new Date() }
		});
		const oldActions = await getAvailableClanActionsForDinoz(user.id, PlaceEnum.CLINIQUE);
		expect(oldActions[0]?.clanAction?.completed).toBe(true);

		const newLeader = await createTestUser({ withTutorial: false });
		const newClan = await prisma.clan.create({
			data: { name: 'Autre chantier', leaderId: newLeader.id, langs: [] }
		});
		await prisma.clanMember.update({ where: { userId: user.id }, data: { clanId: newClan.id } });
		await prisma.user.update({ where: { id: user.id }, data: { clanId: newClan.id } });
		const nextActions = await getAvailableClanActionsForDinoz(user.id, PlaceEnum.CLINIQUE);
		expect(nextActions[0]?.clanAction).toMatchObject({ clanId: newClan.id, progress: 0, completed: false });
	});
});
