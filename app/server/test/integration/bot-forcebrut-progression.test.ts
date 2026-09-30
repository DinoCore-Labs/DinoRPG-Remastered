import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotStrategy } from '../../../prisma/index.js';

import { getBotForcebrutUnlockStep } from '../../src/Bot/Service/botForcebrutProgression.service.js';
import { canBotFightForcebrut } from '../../src/Bot/Service/botForcebrut.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

async function addStatus(dinozId: number, statusId: DinozStatusId) {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot Forcebrut progression', () => {
	it('authenticates the old stone at the university', async () => {
		const user = await createTestUser({
			name: 'ForcebrutStoneBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.UNIVERSITE,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.OLD_STONE);

		await expect(getBotForcebrutUnlockStep(user.id, dinoz.id)).resolves.toEqual({
			type: 'dialog',
			dialogId: 'professor_eugene',
			preferredLinkIds: ['talk', 'question', 'stone', 'stone_yes']
		});
	});

	it('registers at Forcebrut after obtaining the Ashpouk totem', async () => {
		const user = await createTestUser({
			name: 'ForcebrutTotemBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FORCEBRUT,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.ASHPOUK_TOTEM);

		await expect(getBotForcebrutUnlockStep(user.id, dinoz.id)).resolves.toEqual({
			type: 'dialog',
			dialogId: 'forcebrut_organizer',
			preferredLinkIds: ['ok']
		});
	});

	it('uses Forcebrut when registered, supplied with Irma and an opponent remains', async () => {
		const user = await createTestUser({
			name: 'ForcebrutXpBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FORCEBRUT,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.TOURNA);

		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: itemList[Item.POTION_IRMA].itemId,
				quantity: 1
			}
		});

		await prisma.forcebrutTournamentOpponent.create({
			data: {
				step: 1,
				name: 'Test Opponent',
				display: 'A00000000000000',
				raceId: 1,
				level: 1,
				maxLife: 50,
				nbrUpFire: 1,
				nbrUpWood: 1,
				nbrUpWater: 1,
				nbrUpLightning: 1,
				nbrUpAir: 1,
				skillIds: [],
				enabled: true
			}
		});

		await expect(canBotFightForcebrut(user.id, dinoz.id, BotStrategy.FIGHTER)).resolves.toBe(true);
	});
	it('keeps an Irma reserve for balanced bots', async () => {
		const user = await createTestUser({
			name: 'ForcebrutReserveBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			level: 10,
			placeId: PlaceEnum.FORCEBRUT,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.TOURNA);
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: itemList[Item.POTION_IRMA].itemId,
				quantity: 1
			}
		});
		await prisma.forcebrutTournamentOpponent.create({
			data: {
				step: 1,
				name: 'Reserve Opponent',
				display: 'A00000000000000',
				raceId: 1,
				level: 10,
				maxLife: 50,
				nbrUpFire: 1,
				nbrUpWood: 1,
				nbrUpWater: 1,
				nbrUpLightning: 1,
				nbrUpAir: 1,
				skillIds: [],
				enabled: true
			}
		});

		await expect(
			canBotFightForcebrut(user.id, dinoz.id, BotStrategy.BALANCED)
		).resolves.toBe(false);
		await expect(
			canBotFightForcebrut(user.id, dinoz.id, BotStrategy.FIGHTER)
		).resolves.toBe(true);
	});

	it('avoids Forcebrut when health is too low or the opponent is too strong', async () => {
		const user = await createTestUser({
			name: 'ForcebrutRiskBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			level: 8,
			life: 55,
			maxLife: 100,
			placeId: PlaceEnum.FORCEBRUT,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.TOURNA);
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: itemList[Item.POTION_IRMA].itemId,
				quantity: 3
			}
		});
		await prisma.forcebrutTournamentOpponent.create({
			data: {
				step: 1,
				name: 'Risky Opponent',
				display: 'A00000000000000',
				raceId: 1,
				level: 12,
				maxLife: 50,
				nbrUpFire: 1,
				nbrUpWood: 1,
				nbrUpWater: 1,
				nbrUpLightning: 1,
				nbrUpAir: 1,
				skillIds: [],
				enabled: true
			}
		});

		await expect(
			canBotFightForcebrut(user.id, dinoz.id, BotStrategy.BALANCED)
		).resolves.toBe(false);
	});

});
