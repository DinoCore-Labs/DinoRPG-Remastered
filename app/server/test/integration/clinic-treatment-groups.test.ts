import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DinozState } from '../../../prisma/index.js';
import { beginClinicTreatment } from '../../src/Clinic/Service/clinicTreatment.service.js';
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
		data: { name: `ClinicGroup-${user.id}`, leaderId: user.id, langs: [] }
	});
	await prisma.clanMember.create({ data: { userId: user.id, clanId: clan.id } });
	await prisma.user.update({ where: { id: user.id }, data: { clanId: clan.id } });
	await prisma.clanActionProgress.create({
		data: { clanId: clan.id, actionKey: 'hopita', progress: 600, completedAt: new Date() }
	});
	await prisma.userScenario.create({ data: { userId: user.id, scenarioKey: 'clinik', progression: 8 } });
	return user;
}
async function makeDinoz(userId: string, life = 30) {
	return createTestDinoz({
		userId,
		placeId: PlaceEnum.CLINIQUE,
		canRename: false,
		life,
		maxLife: 100,
		fight: false
	});
}
async function treatViaAnna(userId: string, dinozId: number) {
	const dialog = await startDialog({ userId, dinozId, dialogId: 'clinic_anna_services' });
	return selectDialogLink({
		userId,
		dinozId,
		dialogId: 'clinic_anna_services',
		phaseId: dialog.phaseId,
		linkId: 'offre'
	});
}

describe('Clinique : admission des Dinoz en groupe', () => {
	it('détache tous les suiveurs lorsque le Dinoz hospitalisé est meneur', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id);
		const first = await makeDinoz(user.id, 60);
		const second = await makeDinoz(user.id, 40);
		await prisma.dinoz.updateMany({
			where: { id: { in: [first.id, second.id] } },
			data: { leaderId: leader.id }
		});

		const result = await treatViaAnna(user.id, leader.id);
		expect(result.phaseId).toBe('soinok');
		const members = await prisma.dinoz.findMany({
			where: { id: { in: [leader.id, first.id, second.id] } },
			select: { id: true, leaderId: true, state: true, life: true }
		});
		expect(members).toHaveLength(3);
		for (const member of members) expect(member.leaderId).toBeNull();
		expect(members.find(m => m.id === leader.id)?.state).toBe(DinozState.clinic);
		expect(members.find(m => m.id === first.id)?.state).toBeNull();
		expect(members.find(m => m.id === second.id)?.state).toBeNull();
		expect(members.find(m => m.id === first.id)?.life).toBe(60);
	});

	it('ne détache que le patient lorsqu’il est suiveur', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id, 75);
		const patient = await makeDinoz(user.id, 20);
		const other = await makeDinoz(user.id, 70);
		await prisma.dinoz.updateMany({
			where: { id: { in: [patient.id, other.id] } },
			data: { leaderId: leader.id }
		});

		await treatViaAnna(user.id, patient.id);
		const [healed, stillFollowing, groupLeader] = await Promise.all([
			prisma.dinoz.findUniqueOrThrow({ where: { id: patient.id } }),
			prisma.dinoz.findUniqueOrThrow({ where: { id: other.id } }),
			prisma.dinoz.findUniqueOrThrow({ where: { id: leader.id } })
		]);
		expect(healed.state).toBe(DinozState.clinic);
		expect(healed.leaderId).toBeNull();
		expect(stillFollowing.leaderId).toBe(leader.id);
		expect(groupLeader.state).toBeNull();
	});

	it('conserve le groupe lorsqu’un soin est refusé (PV au maximum)', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id, 100);
		const follower = await makeDinoz(user.id, 45);
		await prisma.dinoz.update({ where: { id: follower.id }, data: { leaderId: leader.id } });

		await expect(prisma.$transaction(tx => beginClinicTreatment(tx, user.id, leader.id))).rejects.toMatchObject({
			code: 'clinic.dinozUnavailable',
			statusCode: 409
		});
		const actual = await prisma.dinoz.findUniqueOrThrow({ where: { id: follower.id } });
		expect(actual.leaderId).toBe(leader.id);
		expect(await prisma.clinicTreatment.findUnique({ where: { userId: user.id } })).toBeNull();
	});

	it('annule le détachement si la transaction est abandonnée après l’admission', async () => {
		const user = await setup();
		const leader = await makeDinoz(user.id, 35);
		const follower = await makeDinoz(user.id, 45);
		await prisma.dinoz.update({ where: { id: follower.id }, data: { leaderId: leader.id } });

		await expect(
			prisma.$transaction(async tx => {
				await beginClinicTreatment(tx, user.id, leader.id);
				throw new Error('rollback-check');
			})
		).rejects.toThrow('rollback-check');

		const actualLeader = await prisma.dinoz.findUniqueOrThrow({ where: { id: leader.id } });
		const actualFollower = await prisma.dinoz.findUniqueOrThrow({ where: { id: follower.id } });
		expect(actualLeader.state).toBeNull();
		expect(actualFollower.leaderId).toBe(leader.id);
		expect(await prisma.clinicTreatment.findUnique({ where: { userId: user.id } })).toBeNull();
	});
});
