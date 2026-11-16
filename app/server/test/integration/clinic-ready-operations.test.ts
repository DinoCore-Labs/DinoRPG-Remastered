import { beforeEach, describe, expect, it } from 'vitest';

import { DinozState } from '../../../prisma/index.js';
import {
	finishReadyClinicOperations,
	getActiveClinicStatuses
} from '../../src/Clinic/Service/clinicActivity.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(() => cleanDatabase());

const NOW = new Date('2026-11-16T15:00:00.000Z');
const PAST = new Date('2026-11-16T14:00:00.000Z');
const FUTURE = new Date('2026-11-16T16:00:00.000Z');
const NEW_DISPLAY = '00BBBBBBBBBBB000';

describe('Clinique — finalisation groupée sans dépendance à Dinoz.stateTimer', () => {
	it('termine simultanément un soin et une chirurgie échus, sans toucher aux autres Dinoz', async () => {
		const user = await createTestUser({ withTutorial: false });
		const patient = await createTestDinoz({ userId: user.id, canRename: false, life: 33, maxLife: 130 });
		const operated = await createTestDinoz({ userId: user.id, canRename: false, life: 72 });
		const healthy = await createTestDinoz({ userId: user.id, canRename: false, life: 88 });
		await prisma.dinoz.updateMany({
			where: { id: { in: [patient.id, operated.id] } },
			data: { state: DinozState.clinic, stateTimer: null }
		});
		await prisma.clinicTreatment.create({
			data: { userId: user.id, dinozId: patient.id, startedAt: PAST, readyAt: PAST, finishedAt: null }
		});
		await prisma.dinozSurgery.create({
			data: {
				userId: user.id,
				dinozId: operated.id,
				startedAt: PAST,
				readyAt: PAST,
				finishedAt: null,
				oldDisplay: operated.display,
				newDisplay: NEW_DISPLAY
			}
		});

		await prisma.$transaction(tx =>
			finishReadyClinicOperations(tx, user.id, [patient.id, operated.id, healthy.id], NOW)
		);
		const [afterCare, afterSurgery, afterHealthy] = await Promise.all([
			prisma.dinoz.findUniqueOrThrow({ where: { id: patient.id } }),
			prisma.dinoz.findUniqueOrThrow({ where: { id: operated.id } }),
			prisma.dinoz.findUniqueOrThrow({ where: { id: healthy.id } })
		]);
		expect(afterCare).toMatchObject({ state: null, stateTimer: null, life: 130 });
		expect(afterSurgery).toMatchObject({ state: null, stateTimer: null, life: 72, display: NEW_DISPLAY });
		expect(afterHealthy).toMatchObject({ state: null, life: 88, display: healthy.display });
		expect((await prisma.clinicTreatment.findUniqueOrThrow({ where: { userId: user.id } })).finishedAt).toEqual(NOW);
		expect((await prisma.dinozSurgery.findUniqueOrThrow({ where: { dinozId: operated.id } })).finishedAt).toEqual(NOW);
		expect((await getActiveClinicStatuses(user.id, [patient.id, operated.id])).size).toBe(0);
	});

	it('ignore les traitements non échus, puis ne finalise jamais deux fois', async () => {
		const user = await createTestUser({ withTutorial: false });
		const patient = await createTestDinoz({ userId: user.id, canRename: false, life: 25, maxLife: 100 });
		await prisma.dinoz.update({ where: { id: patient.id }, data: { state: DinozState.clinic, stateTimer: null } });
		await prisma.clinicTreatment.create({
			data: { userId: user.id, dinozId: patient.id, startedAt: NOW, readyAt: FUTURE }
		});

		await prisma.$transaction(tx => finishReadyClinicOperations(tx, user.id, [patient.id], NOW));
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: patient.id } })).life).toBe(25);
		expect((await getActiveClinicStatuses(user.id, [patient.id])).size).toBe(1);

		await prisma.$transaction(tx => finishReadyClinicOperations(tx, user.id, [patient.id], FUTURE));
		const finished = await prisma.clinicTreatment.findUniqueOrThrow({ where: { userId: user.id } });
		expect(finished.finishedAt).toEqual(FUTURE);
		await prisma.$transaction(tx =>
			finishReadyClinicOperations(tx, user.id, [patient.id], new Date(FUTURE.getTime() + 1))
		);
		const secondRead = await prisma.clinicTreatment.findUniqueOrThrow({ where: { userId: user.id } });
		expect(secondRead.finishedAt).toEqual(finished.finishedAt);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: patient.id } })).life).toBe(100);
	});

	it('ne finalise jamais l’opération d’un autre utilisateur', async () => {
		const alice = await createTestUser({ withTutorial: false });
		const bob = await createTestUser({ withTutorial: false });
		const bobPatient = await createTestDinoz({ userId: bob.id, canRename: false, life: 29 });
		await prisma.dinoz.update({ where: { id: bobPatient.id }, data: { state: DinozState.clinic, stateTimer: null } });
		await prisma.clinicTreatment.create({
			data: { userId: bob.id, dinozId: bobPatient.id, startedAt: PAST, readyAt: PAST }
		});
		await prisma.$transaction(tx => finishReadyClinicOperations(tx, alice.id, [bobPatient.id], NOW));
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: bobPatient.id } })).life).toBe(29);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: bobPatient.id } })).state).toBe(DinozState.clinic);
		expect((await prisma.clinicTreatment.findUniqueOrThrow({ where: { userId: bob.id } })).finishedAt).toBeNull();
	});
});
