import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { getCompletedClanActionKeys } from '../../src/Clan/Service/completedClanActionKeys.service.js';
import { getDialogById, loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { listAvailableDialogs, selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => loadDialogs());
beforeEach(async () => cleanDatabase());

async function setClinicStage(userId: string, progression: number) {
	return prisma.userScenario.upsert({
		where: { scenarioKey_userId: { userId, scenarioKey: 'clinik' } },
		create: { userId, scenarioKey: 'clinik', progression },
		update: { progression }
	});
}

async function makeClan(userId: string, name: string) {
	const clan = await prisma.clan.create({ data: { name, leaderId: userId, langs: [] } });
	await prisma.clanMember.create({ data: { clanId: clan.id, userId } });
	await prisma.user.update({ where: { id: userId }, data: { clanId: clan.id } });
	return clan;
}

async function next(userId: string, dinozId: number, dialogId: string, phaseId: string, linkId: string) {
	return selectDialogLink({ userId, dinozId, dialogId, phaseId, linkId });
}

describe('Clinique — dialogue MT et progression de clan', () => {
	it('parcourt les étapes originales de la découverte du terrain jusqu’à la construction (0 → 6)', async () => {
		const user = await createTestUser({ withTutorial: false });
		const dinoz = await createTestDinoz({ userId: user.id, placeId: PlaceEnum.DINOVILLE, canRename: false });
		await prisma.dinozStatus.create({ data: { dinozId: dinoz.id, statusId: DinozStatusId.DINOPLAZA } });

		let phase = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_intro' });
		for (const linkId of ['salut', 'aide', 'blabla', 'end']) {
			phase = await next(user.id, dinoz.id, 'clinic_anna_intro', phase.phaseId, linkId);
		}
		expect(
			(
				await prisma.userScenario.findUniqueOrThrow({
					where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'clinik' } }
				})
			).progression
		).toBe(1);

		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.UNIVERSITE } });
		phase = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'professor_eugene' });
		for (const linkId of ['talk', 'clinic_eugene_avis', 'clinic_eugene_non', 'clinic_eugene_end']) {
			phase = await next(user.id, dinoz.id, 'professor_eugene', phase.phaseId, linkId);
		}
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.DINOVILLE } });
		phase = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'guide' });
		for (const linkId of ['clinic_michel_avis', 'clinic_michel_super']) {
			phase = await next(user.id, dinoz.id, 'guide', phase.phaseId, linkId);
		}

		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.DINOPLAZA } });
		phase = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_wine_seller' });
		for (const linkId of ['ou', 'oue', 'truc', 'end']) {
			phase = await next(user.id, dinoz.id, 'clinic_wine_seller', phase.phaseId, linkId);
		}
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.DINOVILLE } });
		phase = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_return' });
		for (const linkId of ['suite', 'vin', 'end']) {
			phase = await next(user.id, dinoz.id, 'clinic_anna_return', phase.phaseId, linkId);
		}
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.CLINIQUE } });
		phase = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_site' });
		for (const linkId of ['cool', 'snif', 'dinoz', 'voir', 'merci']) {
			phase = await next(user.id, dinoz.id, 'clinic_anna_site', phase.phaseId, linkId);
		}
		expect(
			(
				await prisma.userScenario.findUniqueOrThrow({
					where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'clinik' } }
				})
			).progression
		).toBe(6);
	});

	it('ajoute les embranchements de la clinique chez Eugène et chez Michel', async () => {
		const professor = getDialogById('professor_eugene');
		const guide = getDialogById('guide');
		expect(professor.phases.talk?.next).toContain('clinic_eugene_avis');
		expect(professor.links.clinic_eugene_avis?.target).toBe('clinic_eugene_avis');
		expect(guide.phases.begin?.next).toContain('clinic_michel_avis');
		expect(guide.links.clinic_michel_avis?.target).toBe('clinic_michel_avis');
	});

	it('progresse du professeur (étape 1) au guide (étape 2), puis à Dinoplaza (étape 3)', async () => {
		const user = await createTestUser({ withTutorial: false });
		const dinoz = await createTestDinoz({ userId: user.id, placeId: PlaceEnum.UNIVERSITE, canRename: false });
		await setClinicStage(user.id, 1);

		await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'professor_eugene' });
		await next(user.id, dinoz.id, 'professor_eugene', 'begin', 'talk');
		await next(user.id, dinoz.id, 'professor_eugene', 'talk', 'clinic_eugene_avis');
		await next(user.id, dinoz.id, 'professor_eugene', 'clinic_eugene_avis', 'clinic_eugene_non');
		await next(user.id, dinoz.id, 'professor_eugene', 'clinic_eugene_non', 'clinic_eugene_end');
		expect(
			(
				await prisma.userScenario.findUniqueOrThrow({
					where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'clinik' } }
				})
			).progression
		).toBe(2);

		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.DINOVILLE } });
		await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'guide' });
		await next(user.id, dinoz.id, 'guide', 'begin', 'clinic_michel_avis');
		await next(user.id, dinoz.id, 'guide', 'clinic_michel_avis', 'clinic_michel_super');
		expect(
			(
				await prisma.userScenario.findUniqueOrThrow({
					where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'clinik' } }
				})
			).progression
		).toBe(3);
	});

	it('ouvre la clinique uniquement au clan qui a terminé ses 600 actions, puis réinitialise le scénario après un changement de clan', async () => {
		const user = await createTestUser({ withTutorial: false });
		const secondLeader = await createTestUser({ withTutorial: false });
		const originalClan = await makeClan(user.id, 'OriginalClinicBuilders');
		const otherClan = await makeClan(secondLeader.id, 'OtherClinicBuilders');
		const dinoz = await createTestDinoz({ userId: user.id, placeId: PlaceEnum.CLINIQUE, canRename: false });
		await setClinicStage(user.id, 6);

		expect(await getCompletedClanActionKeys(prisma, user.id)).toEqual([]);
		expect(
			(await listAvailableDialogs({ userId: user.id, dinozId: dinoz.id })).some(
				dialog => dialog.id === 'clinic_anna_finished'
			)
		).toBe(false);
		await prisma.clanActionProgress.create({
			data: { clanId: originalClan.id, actionKey: 'hopita', progress: 600, completedAt: new Date() }
		});
		expect(await getCompletedClanActionKeys(prisma, user.id)).toEqual(['hopita']);
		expect(
			(await listAvailableDialogs({ userId: user.id, dinozId: dinoz.id })).some(
				dialog => dialog.id === 'clinic_anna_finished'
			)
		).toBe(true);

		await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_finished' });
		await next(user.id, dinoz.id, 'clinic_anna_finished', 'begin', 'ok');
		await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_opening' });
		await next(user.id, dinoz.id, 'clinic_anna_opening', 'begin', 'ok');
		await next(user.id, dinoz.id, 'clinic_anna_opening', 'ok', 'merci');
		expect(
			(
				await prisma.userScenario.findUniqueOrThrow({
					where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'clinik' } }
				})
			).progression
		).toBe(8);

		await prisma.clanMember.update({ where: { userId: user.id }, data: { clanId: otherClan.id } });
		await prisma.user.update({ where: { id: user.id }, data: { clanId: otherClan.id } });
		expect(await getCompletedClanActionKeys(prisma, user.id)).toEqual([]);
		await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_new_clan' });
		await next(user.id, dinoz.id, 'clinic_anna_new_clan', 'begin', 'end');
		expect(
			(
				await prisma.userScenario.findUniqueOrThrow({
					where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'clinik' } }
				})
			).progression
		).toBe(6);
		expect(
			(
				await prisma.clanActionProgress.findUniqueOrThrow({
					where: { clanId_actionKey: { clanId: originalClan.id, actionKey: 'hopita' } }
				})
			).progress
		).toBe(600);
	});

	it('rejette le dialogue d’inauguration si son clan n’a pas terminé le chantier', async () => {
		const user = await createTestUser({ withTutorial: false });
		await makeClan(user.id, 'UnfinishedClinic');
		const dinoz = await createTestDinoz({ userId: user.id, placeId: PlaceEnum.CLINIQUE, canRename: false });
		await setClinicStage(user.id, 6);
		await expect(
			startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_finished' })
		).rejects.toThrow();
	});
});
