import { CLINIC_SURGERY_COOLDOWN_MS } from '@dinorpg/core/models/clinic/clinicSurgery.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DinozState } from '../../../prisma/index.js';
import { beginClinicSurgery, finishClinicSurgeryIfReady } from '../../src/Clinic/Service/clinicSurgery.service.js';
import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => loadDialogs());
beforeEach(() => cleanDatabase());

async function setup(userId: string, completed = true) {
	const clan = await prisma.clan.create({ data: { name: `ClinicSurgery-${userId}`, leaderId: userId, langs: [] } });
	await prisma.clanMember.create({ data: { userId, clanId: clan.id } });
	await prisma.user.update({ where: { id: userId }, data: { clanId: clan.id } });
	await prisma.clanActionProgress.create({
		data: {
			clanId: clan.id,
			actionKey: 'hopita',
			progress: completed ? 600 : 599,
			completedAt: completed ? new Date() : null
		}
	});
	await prisma.userScenario.create({ data: { userId, scenarioKey: 'clinik', progression: 8 } });
	return clan;
}

async function eligibleDinoz(userId: string) {
	return createTestDinoz({
		userId,
		canRename: false,
		placeId: PlaceEnum.CLINIQUE,
		display: '00AAAAAAAAAAA111',
		life: 52,
		maxLife: 100
	});
}

async function operateViaAnna(userId: string, dinozId: number) {
	const begin = await startDialog({ userId, dinozId, dialogId: 'clinic_anna_services' });
	expect(begin.links.some(link => link.id === 'ope')).toBe(true);
	const warning = await selectDialogLink({
		userId,
		dinozId,
		dialogId: 'clinic_anna_services',
		phaseId: 'begin',
		linkId: 'ope'
	});
	expect(warning.links.some(link => link.id === 'oui')).toBe(true);
	return selectDialogLink({ userId, dinozId, dialogId: 'clinic_anna_services', phaseId: 'ope', linkId: 'oui' });
}

describe('Anna Tomie — cosmetic surgery', () => {
	it('allows surgery without subscription requirements', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setup(user.id);
		const dinoz = await eligibleDinoz(user.id);
		const dialog = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_services' });
		expect(dialog.links.some(link => link.id === 'ope')).toBe(true);
		await prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id));
		const pending = await prisma.dinozSurgery.findUniqueOrThrow({ where: { dinozId: dinoz.id } });
		expect(pending.finishedAt).toBeNull();
	});

	it('returns a stable 409 without internal diagnostic details', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setup(user.id);
		const dinoz = await eligibleDinoz(user.id);
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.DINOVILLE } });
		await expect(prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id))).rejects.toMatchObject({
			code: 'clinic.surgeryDinozUnavailable',
			statusCode: 409,
			params: undefined
		});
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { placeId: PlaceEnum.CLINIQUE, display: 'invalid' } });
		await expect(prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id))).rejects.toMatchObject({
			code: 'clinic.surgeryDinozUnavailable',
			statusCode: 409,
			params: undefined
		});
	});

	it('starts after explicit consent, immobilises one hour, then replaces only the visual display', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setup(user.id);
		const dinoz = await eligibleDinoz(user.id);
		const confirmation = await operateViaAnna(user.id, dinoz.id);
		expect(confirmation.phaseId).toBe('oui');
		const pending = await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } });
		expect(pending.state).toBe(DinozState.clinic);
		expect(pending.display).toBe(dinoz.display);
		expect(pending.life).toBe(52);
		const surgery = await prisma.dinozSurgery.findUniqueOrThrow({ where: { dinozId: dinoz.id } });
		expect(surgery.readyAt.getTime() - surgery.startedAt.getTime()).toBe(3_600_000);
		expect(surgery.newDisplay).not.toBe(dinoz.display);
		expect(
			await prisma.$transaction(tx =>
				finishClinicSurgeryIfReady(tx, user.id, dinoz.id, new Date(surgery.readyAt.getTime() - 1))
			)
		).toBe(false);
		expect(await prisma.$transaction(tx => finishClinicSurgeryIfReady(tx, user.id, dinoz.id, surgery.readyAt))).toBe(
			true
		);
		expect(await prisma.$transaction(tx => finishClinicSurgeryIfReady(tx, user.id, dinoz.id, surgery.readyAt))).toBe(
			false
		);
		const after = await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } });
		expect(after.state).toBeNull();
		expect(after.stateTimer).toBeNull();
		expect(after.display).toBe(surgery.newDisplay);
		expect(after.life).toBe(dinoz.life);
		expect(after.raceId).toBe(dinoz.raceId);
		expect(after.level).toBe(dinoz.level);
		expect(after.experience).toBe(dinoz.experience);
	});

	it('completes an operation started before a clan change', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setup(user.id);
		const dinoz = await eligibleDinoz(user.id);
		await prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id));
		const surgery = await prisma.dinozSurgery.findUniqueOrThrow({ where: { dinozId: dinoz.id } });
		await prisma.clanMember.delete({ where: { userId: user.id } });
		await prisma.user.update({ where: { id: user.id }, data: { clanId: null } });
		expect(await prisma.$transaction(tx => finishClinicSurgeryIfReady(tx, user.id, dinoz.id, surgery.readyAt))).toBe(
			true
		);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: dinoz.id } })).display).toBe(surgery.newDisplay);
	});

	it('enforces thirty days on the same Dinoz; does not affect other Dinoz', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setup(user.id);
		const first = await eligibleDinoz(user.id);
		const second = await eligibleDinoz(user.id);
		await prisma.$transaction(tx => beginClinicSurgery(tx, user.id, first.id));
		const surgery = await prisma.dinozSurgery.findUniqueOrThrow({ where: { dinozId: first.id } });
		await prisma.$transaction(tx => finishClinicSurgeryIfReady(tx, user.id, first.id, surgery.readyAt));
		await expect(prisma.$transaction(tx => beginClinicSurgery(tx, user.id, first.id))).rejects.toThrow();
		await prisma.$transaction(tx => beginClinicSurgery(tx, user.id, second.id));
		const afterMonth = new Date(surgery.startedAt.getTime() + CLINIC_SURGERY_COOLDOWN_MS + 1);
		await prisma.$transaction(tx => beginClinicSurgery(tx, user.id, first.id, afterMonth));
		expect((await prisma.dinozSurgery.findUniqueOrThrow({ where: { dinozId: first.id } })).finishedAt).toBeNull();
	});

	it('refuses unbuilt clinic, foreign ownership and unavailable Dinoz', async () => {
		const user = await createTestUser({ withTutorial: false });
		const other = await createTestUser({ withTutorial: false });
		const clan = await setup(user.id, false);
		const dinoz = await eligibleDinoz(user.id);
		await expect(prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id))).rejects.toThrow();
		await prisma.clanActionProgress.update({
			where: { clanId_actionKey: { clanId: clan.id, actionKey: 'hopita' } },
			data: { progress: 600, completedAt: new Date() }
		});
		await expect(prisma.$transaction(tx => beginClinicSurgery(tx, other.id, dinoz.id))).rejects.toThrow();
		await prisma.dinoz.update({ where: { id: dinoz.id }, data: { state: DinozState.resting } });
		await expect(prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id))).rejects.toThrow();
		expect(await prisma.dinozSurgery.findUnique({ where: { dinozId: dinoz.id } })).toBeNull();
	});

	it('allows declining the operation without any state change', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setup(user.id);
		const dinoz = await eligibleDinoz(user.id);
		await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'clinic_anna_services' });
		const refusal = await selectDialogLink({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'clinic_anna_services',
			phaseId: 'ope',
			linkId: 'non'
		});
		expect(refusal.phaseId).toBe('non');
		expect(await prisma.dinozSurgery.findUnique({ where: { dinozId: dinoz.id } })).toBeNull();
	});

	it('is safe against two simultaneous confirmed requests', async () => {
		const user = await createTestUser({ withTutorial: false });
		await setup(user.id);
		const dinoz = await eligibleDinoz(user.id);
		const outcomes = await Promise.allSettled([
			prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id), { maxWait: 5_000, timeout: 30_000 }),
			prisma.$transaction(tx => beginClinicSurgery(tx, user.id, dinoz.id), { maxWait: 5_000, timeout: 30_000 })
		]);
		expect(outcomes.filter(result => result.status === 'fulfilled')).toHaveLength(1);
		expect(outcomes.filter(result => result.status === 'rejected')).toHaveLength(1);
	});
});
