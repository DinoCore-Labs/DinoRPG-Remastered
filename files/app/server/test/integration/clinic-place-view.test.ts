import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { getCompletedClanActionKeys } from '../../src/Clan/Service/completedClanActionKeys.service.js';
import { getDinozFicheRequest } from '../../src/Dinoz/Controller/getDinozFiche.controller.js';
import { prisma } from '../../src/prisma.js';
import { toDinozFiche } from '../../src/utils/dinoz/dinozFiche.mapper.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('clinic place view for the current clan', () => {
	it('changes only the visual place at 600/600, then reverts when joining an unfinished clan', async () => {
		const alice = await createTestUser({ withTutorial: false });
		const bob = await createTestUser({ withTutorial: false });
		const dinoz = await createTestDinoz({
			userId: alice.id,
			placeId: PlaceEnum.CLINIQUE,
			canRename: false
		});
		const completedClan = await prisma.clan.create({
			data: { name: 'FinishedClinic', leaderId: alice.id, langs: [] }
		});
		const otherClan = await prisma.clan.create({
			data: { name: 'NewClinicBuilders', leaderId: bob.id, langs: [] }
		});
		await prisma.clanMember.create({ data: { userId: alice.id, clanId: completedClan.id } });
		await prisma.user.update({ where: { id: alice.id }, data: { clanId: completedClan.id } });

		async function view() {
			const player = await getDinozFicheRequest(dinoz.id, alice.id);
			if (!player) throw new Error('Missing test player');
			const completedKeys = await getCompletedClanActionKeys(prisma, alice.id);
			return toDinozFiche(player, dinoz.id, null, null, completedKeys);
		}

		const before = await view();
		expect(before.placeId).toBe(PlaceEnum.CLINIQUE);
		expect(before.displayPlaceId).toBe(PlaceEnum.CLINIQUE);
		await prisma.clanActionProgress.create({
			data: { clanId: completedClan.id, actionKey: 'hopita', progress: 599 }
		});
		expect((await view()).displayPlaceId).toBe(PlaceEnum.CLINIQUE);

		await prisma.clanActionProgress.update({
			where: { clanId_actionKey: { clanId: completedClan.id, actionKey: 'hopita' } },
			data: { progress: 600, completedAt: new Date() }
		});
		const built = await view();
		expect(built.placeId).toBe(PlaceEnum.CLINIQUE);
		expect(built.displayPlaceId).toBe(PlaceEnum.CLINI2);
		expect(built.borderPlace).toContain(PlaceEnum.DINOPLAZA);

		await prisma.clanMember.update({ where: { userId: alice.id }, data: { clanId: otherClan.id } });
		await prisma.user.update({ where: { id: alice.id }, data: { clanId: otherClan.id } });
		const changedClan = await view();
		expect(changedClan.placeId).toBe(PlaceEnum.CLINIQUE);
		expect(changedClan.displayPlaceId).toBe(PlaceEnum.CLINIQUE);
	});
});
