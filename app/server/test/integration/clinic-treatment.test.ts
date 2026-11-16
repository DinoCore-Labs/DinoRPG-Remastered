import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DinozState } from '../../../prisma/index.js';
import {
	beginClinicTreatment,
	finishClinicTreatmentIfReady
} from '../../src/Clinic/Service/clinicTreatment.service.js';
import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { listAvailableDialogs, selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => loadDialogs());
beforeEach(() => cleanDatabase());

async function finishedClinicClan(userId: string, name: string, progress = 600) {
	const clan = await prisma.clan.create({ data: { name, leaderId: userId, langs: [] } });
	await prisma.clanMember.create({ data: { userId, clanId: clan.id } });
	await prisma.user.update({ where: { id: userId }, data: { clanId: clan.id } });
	await prisma.clanActionProgress.create({
		data: {
			clanId: clan.id,
			actionKey: 'hopita',
			progress,
			completedAt: progress >= 600 ? new Date() : null
		}
	});
	return clan;
}
async function clinicScenario(userId: string, progression = 8) {
	return prisma.userScenario.create({
		data: { userId, scenarioKey: 'clinik', progression }
	});
}
async function woundedDinoz(userId: string, life = 22) {
	return createTestDinoz({ userId, placeId: PlaceEnum.CLINIQUE, canRename: false, life, maxLife: 100, fight: false });
}
async function beginViaAnna(userId: string, dinozId: number) {
	const dialog = await startDialog({ userId, dinozId, dialogId: 'clinic_anna_services' });
	return selectDialogLink({
		userId,
		dinozId,
		dialogId: 'clinic_anna_services',
		phaseId: dialog.phaseId,
		linkId: 'offre'
	});
}

async function moveTreatmentClockIntoPast(userId: string, hoursSinceStart: number) {
	const startedAt = new Date(Date.now() - hoursSinceStart * 60 * 60 * 1000);
	const readyAt = new Date(startedAt.getTime() + 60 * 60 * 1000);
	await prisma.clinicTreatment.update({ where: { userId }, data: { startedAt, readyAt } });
	return { startedAt, readyAt };
}

describe('Anna Tomie — soins MT', () => {
	it('starts a free one-hour treatment via Anna, without consuming a fight action', async () => {
		const user = await createTestUser({ withTutorial: false });
		await finishedClinicClan(user.id, 'ClinicOpenA');
		await clinicScenario(user.id);
		const dinoz = await woundedDinoz(user.id);

		const dialogs = await listAvailableDialogs({ userId: user.id, dinozId: dinoz.id });
		expect(dialogs.some(dialog => dialog.id === 'clinic_anna_services')).toBe(true);
		const response = await beginViaAnna(user.id, dinoz.id);
		expect(response.phaseId).toBe('soinok');
		const treated = await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } });
		expect(treated.state).toBe(DinozState.clinic);
		expect(treated.life).toBe(22);
		expect(treated.fight).toBe(false);
		const treatment = await prisma.clinicTreatment.findUniqueOrThrow({ where: { userId: user.id } });
		expect(treatment.readyAt.getTime() - treatment.startedAt.getTime()).toBe(3_600_000);
		expect(treated.stateTimer).toBeNull();
		expect(
			(await prisma.userScenario.findFirst({ where: { userId: user.id, scenarioKey: 'clinik' } }))?.progression
		).toBe(9);
	});

	it('heals automatically after one hour, without second action or double heal', async () => {
		const user = await createTestUser({ withTutorial: false });
		await finishedClinicClan(user.id, 'ClinicOpenB');
		await clinicScenario(user.id);
		const dinoz = await woundedDinoz(user.id);
		await beginViaAnna(user.id, dinoz.id);
		expect(await prisma.$transaction(tx => finishClinicTreatmentIfReady(tx, user.id, dinoz.id))).toBe(false);
		const { readyAt } = await moveTreatmentClockIntoPast(user.id, 2);
		expect(await prisma.$transaction(tx => finishClinicTreatmentIfReady(tx, user.id, dinoz.id, readyAt))).toBe(true);
		expect(await prisma.$transaction(tx => finishClinicTreatmentIfReady(tx, user.id, dinoz.id))).toBe(false);
		const healed = await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } });
		expect(healed.state).toBeNull();
		expect(healed.stateTimer).toBeNull();
		expect(healed.life).toBe(100);
	});

	it('enforces a 20-hour cooldown even on another Dinoz, then allows another treatment', async () => {
		const user = await createTestUser({ withTutorial: false });
		await finishedClinicClan(user.id, 'ClinicOpenC');
		await clinicScenario(user.id);
		const first = await woundedDinoz(user.id);
		const second = await woundedDinoz(user.id, 35);
		await beginViaAnna(user.id, first.id);
		const { readyAt } = await moveTreatmentClockIntoPast(user.id, 2);
		await prisma.$transaction(tx => finishClinicTreatmentIfReady(tx, user.id, first.id, readyAt));
		await expect(prisma.$transaction(tx => beginClinicTreatment(tx, user.id, second.id))).rejects.toThrow();
		await prisma.clinicTreatment.update({
			where: { userId: user.id },
			data: { startedAt: new Date(Date.now() - 21 * 60 * 60 * 1000) }
		});
		await prisma.$transaction(tx => beginClinicTreatment(tx, user.id, second.id));
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: second.id } })).state).toBe(DinozState.clinic);
	});

	it('refuses unbuilt clinic, other owner, simultaneous treatments, and full-HP Dinoz', async () => {
		const user = await createTestUser({ withTutorial: false });
		const other = await createTestUser({ withTutorial: false });
		const clan = await finishedClinicClan(user.id, 'ClinicUnbuilt', 599);
		await clinicScenario(user.id);
		const dinoz = await woundedDinoz(user.id);
		await expect(prisma.$transaction(tx => beginClinicTreatment(tx, user.id, dinoz.id))).rejects.toThrow();
		await prisma.clanActionProgress.update({
			where: { clanId_actionKey: { clanId: clan.id, actionKey: 'hopita' } },
			data: { progress: 600, completedAt: new Date() }
		});
		await expect(prisma.$transaction(tx => beginClinicTreatment(tx, other.id, dinoz.id))).rejects.toThrow();
		const healthy = await woundedDinoz(user.id, 100);
		await expect(prisma.$transaction(tx => beginClinicTreatment(tx, user.id, healthy.id))).rejects.toThrow();
		const another = await woundedDinoz(user.id, 30);
		const results = await Promise.allSettled([
			prisma.$transaction(tx => beginClinicTreatment(tx, user.id, dinoz.id), { maxWait: 5_000, timeout: 30_000 }),
			prisma.$transaction(tx => beginClinicTreatment(tx, user.id, another.id), { maxWait: 5_000, timeout: 30_000 })
		]);
		expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
		expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
	});

	it('completes an already-started treatment even if the player leaves their clan', async () => {
		const user = await createTestUser({ withTutorial: false });
		await finishedClinicClan(user.id, 'ClinicOld');
		await clinicScenario(user.id);
		const dinoz = await woundedDinoz(user.id);
		await beginViaAnna(user.id, dinoz.id);
		await prisma.clanMember.delete({ where: { userId: user.id } });
		await prisma.user.update({ where: { id: user.id }, data: { clanId: null } });
		const { readyAt } = await moveTreatmentClockIntoPast(user.id, 2);
		expect(await prisma.$transaction(tx => finishClinicTreatmentIfReady(tx, user.id, dinoz.id, readyAt))).toBe(true);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).life).toBe(100);
	});
});
