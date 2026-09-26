import { DOJO_COST } from '@dinorpg/core/models/dojo/constants.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { DOJO_SCENARIO_KEY, DOJO_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/dojoScenario.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { MoneyType } from '../../../prisma/index.js';
import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { buildDojoTx } from '../../src/Dojo/Service/dojo.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => {
	loadDialogs();
});

beforeEach(async () => {
	await cleanDatabase();
});

async function createDojoScenario(userId: string, progression: number) {
	return prisma.userScenario.create({
		data: {
			userId,
			scenarioKey: DOJO_SCENARIO_KEY,
			progression
		}
	});
}

async function getDojoProgression(userId: string) {
	const scenario = await prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: DOJO_SCENARIO_KEY
			}
		}
	});
	return scenario?.progression ?? 0;
}

async function getGold(userId: string) {
	const wallet = await prisma.userWallet.findUniqueOrThrow({
		where: {
			userId_type: {
				userId,
				type: MoneyType.GOLD
			}
		}
	});
	return wallet.amount;
}

async function setGold(userId: string, amount: number) {
	await prisma.userWallet.update({
		where: {
			userId_type: {
				userId,
				type: MoneyType.GOLD
			}
		},
		data: {
			amount
		}
	});
}

describe('Dojo scenario', () => {
	describe('Maître Zénit', () => {
		it('unlocks the Dojo through the Maître Zénit dialog', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.FORCEBRUT
			});
			const begin = await startDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'maitrZenit'
			});
			expect(begin.phaseId).toBe('begin');
			let phase = await selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'maitrZenit',
				phaseId: 'begin',
				linkId: 'talk2'
			});
			phase = await selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'maitrZenit',
				phaseId: phase.phaseId,
				linkId: 'ouep'
			});
			phase = await selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'maitrZenit',
				phaseId: phase.phaseId,
				linkId: 'hm2'
			});
			phase = await selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'maitrZenit',
				phaseId: phase.phaseId,
				linkId: 'dojo'
			});
			phase = await selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'maitrZenit',
				phaseId: phase.phaseId,
				linkId: 'va'
			});
			phase = await selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'maitrZenit',
				phaseId: phase.phaseId,
				linkId: 'bien'
			});
			expect(phase.phaseId).toBe('bien');
			expect(await getDojoProgression(user.id)).toBe(DOJO_SCENARIO_STEPS.UNLOCKED);
			expect(
				await prisma.dojo.count({
					where: {
						userId: user.id
					}
				})
			).toBe(0);
		});
	});

	describe('construction', () => {
		it('builds the Dojo, charges the player and completes the scenario', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createDojoScenario(user.id, DOJO_SCENARIO_STEPS.UNLOCKED);
			await setGold(user.id, DOJO_COST + 1234);
			const result = await prisma.$transaction(tx => buildDojoTx(tx, user.id));
			expect(result.dojo.userId).toBe(user.id);
			expect(await getGold(user.id)).toBe(1234);
			expect(await getDojoProgression(user.id)).toBe(DOJO_SCENARIO_STEPS.BUILT);
			expect(
				await prisma.dojo.count({
					where: {
						userId: user.id
					}
				})
			).toBe(1);
		});

		it('rejects construction before the scenario is unlocked', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const goldBefore = await getGold(user.id);
			await expect(prisma.$transaction(tx => buildDojoTx(tx, user.id))).rejects.toMatchObject({
				code: 'dojo not unlocked'
			});
			expect(await getGold(user.id)).toBe(goldBefore);
			expect(
				await prisma.dojo.count({
					where: {
						userId: user.id
					}
				})
			).toBe(0);
		});

		it('rejects construction when the player does not have enough gold and rolls back progression', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createDojoScenario(user.id, DOJO_SCENARIO_STEPS.UNLOCKED);
			await setGold(user.id, DOJO_COST - 1);
			const goldBefore = await getGold(user.id);
			await expect(prisma.$transaction(tx => buildDojoTx(tx, user.id))).rejects.toMatchObject({
				code: 'notEnoughMoney'
			});
			expect(await getGold(user.id)).toBe(goldBefore);
			expect(await getDojoProgression(user.id)).toBe(DOJO_SCENARIO_STEPS.UNLOCKED);
			expect(
				await prisma.dojo.count({
					where: {
						userId: user.id
					}
				})
			).toBe(0);
		});

		it('rejects construction when the Dojo is already built', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createDojoScenario(user.id, DOJO_SCENARIO_STEPS.BUILT);
			await prisma.dojo.create({
				data: {
					userId: user.id
				}
			});
			const goldBefore = await getGold(user.id);
			await expect(prisma.$transaction(tx => buildDojoTx(tx, user.id))).rejects.toMatchObject({
				code: 'dojo already built'
			});
			expect(await getGold(user.id)).toBe(goldBefore);
			expect(
				await prisma.dojo.count({
					where: {
						userId: user.id
					}
				})
			).toBe(1);
		});

		it('builds and charges only once during concurrent requests', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createDojoScenario(user.id, DOJO_SCENARIO_STEPS.UNLOCKED);
			await setGold(user.id, DOJO_COST * 2);
			const build = () => prisma.$transaction(tx => buildDojoTx(tx, user.id));
			const results = await Promise.allSettled([build(), build()]);
			expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
			expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
			expect(
				await prisma.dojo.count({
					where: {
						userId: user.id
					}
				})
			).toBe(1);
			expect(await getGold(user.id)).toBe(DOJO_COST);
			expect(await getDojoProgression(user.id)).toBe(DOJO_SCENARIO_STEPS.BUILT);
		});

		it('rolls back the Dojo, gold and progression together', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createDojoScenario(user.id, DOJO_SCENARIO_STEPS.UNLOCKED);
			await setGold(user.id, DOJO_COST + 5000);
			const goldBefore = await getGold(user.id);
			await expect(
				prisma.$transaction(async tx => {
					await buildDojoTx(tx, user.id);
					throw new Error('force rollback');
				})
			).rejects.toThrow('force rollback');
			expect(await getGold(user.id)).toBe(goldBefore);
			expect(await getDojoProgression(user.id)).toBe(DOJO_SCENARIO_STEPS.UNLOCKED);
			expect(
				await prisma.dojo.count({
					where: {
						userId: user.id
					}
				})
			).toBe(0);
		});

		it('handles an inconsistent existing Dojo without charging the player', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			/*
			 * État volontairement incohérent :
			 *
			 * scénario = 1
			 * mais dojo déjà présent.
			 */
			await createDojoScenario(user.id, DOJO_SCENARIO_STEPS.UNLOCKED);
			await prisma.dojo.create({
				data: {
					userId: user.id
				}
			});
			const goldBefore = await getGold(user.id);
			await expect(prisma.$transaction(tx => buildDojoTx(tx, user.id))).rejects.toMatchObject({
				code: 'dojo already built'
			});
			expect(await getGold(user.id)).toBe(goldBefore);
			expect(await getDojoProgression(user.id)).toBe(DOJO_SCENARIO_STEPS.UNLOCKED);
		});
	});
});
