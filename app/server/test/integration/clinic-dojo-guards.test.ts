import { beforeEach, describe, expect, it } from 'vitest';

import { DinozState } from '../../../prisma/index.js';
import { getPlayerDinozInformationForTeam } from '../../src/Dojo/Controller/dojoChallenge.controller.js';
import { availableDinozIds, getDojoFightPreparationRequest } from '../../src/Dojo/Controller/dojoFight.controller.js';
import { getDinozForDojoFight } from '../../src/Dojo/Service/dojoTest.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(() => cleanDatabase());

describe('Clinique : disponibilité au Dojo (identique au repos)', () => {
	it('autorise les états clinic, resting et null dans la liste des combats amicaux', () => {
		expect(
			availableDinozIds([
				{ id: 1, state: DinozState.clinic },
				{ id: 2, state: DinozState.resting },
				{ id: 3, state: null }
			])
		).toEqual([1, 2, 3]);
	});

	it('garde le Dinoz hospitalisé sélectionnable des deux côtés d’un combat amical', async () => {
		const owner = await createTestUser({ withTutorial: false });
		const opponent = await createTestUser({ withTutorial: false });
		const patient = await createTestDinoz({ userId: owner.id, canRename: false });
		const otherPatient = await createTestDinoz({ userId: opponent.id, canRename: false });
		await prisma.dinoz.updateMany({
			where: { id: { in: [patient.id, otherPatient.id] } },
			data: { state: DinozState.clinic }
		});

		const left = await getDojoFightPreparationRequest(owner.id);
		const right = await getDojoFightPreparationRequest(opponent.id);
		expect(left).not.toBeNull();
		expect(right).not.toBeNull();
		expect(availableDinozIds(left!.dinoz)).toContain(patient.id);
		expect(availableDinozIds(right!.dinoz)).toContain(otherPatient.id);

		// La récupération des combattants ne modifie pas la prise en charge.
		expect(await getDinozForDojoFight([patient.id, otherPatient.id])).toHaveLength(2);
		expect((await prisma.dinoz.findUniqueOrThrow({ where: { id: patient.id } })).state).toBe(DinozState.clinic);
	});

	it('autorise également la sélection pour les équipes de défi / tournoi', async () => {
		const user = await createTestUser({ withTutorial: false });
		const patient = await createTestDinoz({ userId: user.id, canRename: false });
		const resting = await createTestDinoz({ userId: user.id, canRename: false });
		await prisma.dinoz.update({ where: { id: patient.id }, data: { state: DinozState.clinic } });
		await prisma.dinoz.update({ where: { id: resting.id }, data: { state: DinozState.resting } });

		const selection = await getPlayerDinozInformationForTeam(user.id);
		expect(selection.dinoz.map(dinoz => dinoz.id)).toEqual(expect.arrayContaining([patient.id, resting.id]));
	});

	it('conserve les exclusions historiques : frozen, sacrificed et selling', () => {
		expect(
			availableDinozIds([
				{ id: 1, state: DinozState.clinic },
				{ id: 2, state: DinozState.frozen },
				{ id: 3, state: DinozState.sacrificed },
				{ id: 4, state: DinozState.selling },
				{ id: 5, state: DinozState.resting }
			])
		).toEqual([1, 5]);
	});
});
