import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DinozState } from '../../../prisma/index.js';
import { beginClinicSurgery } from '../../src/Clinic/Service/clinicSurgery.service.js';
import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => loadDialogs());
beforeEach(() => cleanDatabase());

async function setup() {
	const user = await createTestUser({ withTutorial: false });
	const clan = await prisma.clan.create({
		data: { name: `ClinicSurgeryGroup-${user.id}`, leaderId: user.id, langs: [] }
	});
	await prisma.clanMember.create({ data: { userId: user.id, clanId: clan.id } });
	await prisma.user.update({ where: { id: user.id }, data: { clanId: clan.id } });
	await prisma.clanActionProgress.create({
		data: { clanId: clan.id, actionKey: 'hopita', progress: 600, completedAt: new Date() }
	});
	await prisma.userScenario.create({ data: { userId: user.id, scenarioKey: 'clinik', progression: 8 } });
	// Deliberately no elites/surge userTracking entries.
	return user;
}

async function makeDinoz(userId: string) {
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
		phaseId: begin.phaseId,
		linkId: 'ope'
	});
	expect(warning.links.some(link => link.id === 'oui')).toBe(true);
	return selectDialogLink({
		userId,
		dinozId,
		dialogId: 'clinic_anna_services',
		phaseId: warning.phaseId,
		linkId: 'oui'
	});
}

describe('Anna Tomie — chirurgie des Dinoz en groupe et fin des uvar payants', () => {
	it('détache le meneur et tous ses suiveurs à la confirmation du dialogue', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id);
		const followerA = await makeDinoz(user.id);
		const followerB = await makeDinoz(user.id);
		await prisma.dinoz.updateMany({
			where: { id: { in: [followerA.id, followerB.id] } },
			data: { leaderId: leader.id }
		});

		const confirmation = await operateViaAnna(user.id, leader.id);
		expect(confirmation.phaseId).toBe('oui');
		const members = await prisma.dinoz.findMany({
			where: { id: { in: [leader.id, followerA.id, followerB.id] } },
			select: { id: true, leaderId: true, state: true }
		});
		for (const member of members) expect(member.leaderId).toBeNull();
		expect(members.find(member => member.id === leader.id)?.state).toBe(DinozState.clinic);
		expect(members.find(member => member.id === followerA.id)?.state).toBeNull();
		expect(members.find(member => member.id === followerB.id)?.state).toBeNull();
		expect(await prisma.dinozSurgery.findUnique({ where: { dinozId: leader.id } })).not.toBeNull();
	});

	it('détache seulement le patient suiveur, en conservant le reste de son groupe', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id);
		const patient = await makeDinoz(user.id);
		const other = await makeDinoz(user.id);
		await prisma.dinoz.updateMany({
			where: { id: { in: [patient.id, other.id] } },
			data: { leaderId: leader.id }
		});

		await prisma.$transaction(tx => beginClinicSurgery(tx, user.id, patient.id));
		const patientAfter = await prisma.dinoz.findUniqueOrThrow({ where: { id: patient.id } });
		const otherAfter = await prisma.dinoz.findUniqueOrThrow({ where: { id: other.id } });
		expect(patientAfter.state).toBe(DinozState.clinic);
		expect(patientAfter.leaderId).toBeNull();
		expect(otherAfter.leaderId).toBe(leader.id);
	});

	it('ne modifie pas les groupes lorsque le Dinoz est indisponible', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id);
		const follower = await makeDinoz(user.id);
		await prisma.dinoz.update({ where: { id: follower.id }, data: { leaderId: leader.id } });
		await prisma.dinoz.update({ where: { id: leader.id }, data: { state: DinozState.resting } });
		await expect(prisma.$transaction(tx => beginClinicSurgery(tx, user.id, leader.id))).rejects.toMatchObject({
			code: 'clinic.surgeryDinozUnavailable',
			statusCode: 409
		});
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: follower.id } })).leaderId).toBe(leader.id);
		expect(await prisma.dinozSurgery.findUnique({ where: { dinozId: leader.id } })).toBeNull();
	});

	it('annule détachement et opération si la transaction échoue', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id);
		const follower = await makeDinoz(user.id);
		await prisma.dinoz.update({ where: { id: follower.id }, data: { leaderId: leader.id } });

		await expect(
			prisma.$transaction(async tx => {
				await beginClinicSurgery(tx, user.id, leader.id);
				throw new Error('rollback-check');
			})
		).rejects.toThrow('rollback-check');

		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: follower.id } })).leaderId).toBe(leader.id);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: leader.id } })).state).toBeNull();
		expect(await prisma.dinozSurgery.findUnique({ where: { dinozId: leader.id } })).toBeNull();
	});
});
