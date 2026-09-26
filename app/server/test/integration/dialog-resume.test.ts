import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import {
	listAvailableDialogs,
	resumeDialogPhase,
	selectDialogLink,
	startDialog
} from '../../src/Dialog/Service/dialog.service.js';
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

async function setIntroProgression(userId: string, progression: number): Promise<void> {
	await prisma.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: 'intro'
			}
		},
		create: {
			userId,
			scenarioKey: 'intro',
			progression
		},
		update: {
			progression
		}
	});
}

describe('dialog post-fight resume', () => {
	it('allows Taurus dialog to resume after victory and removes it after completion', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CHUTES_MUTANTES
		});
		/*
		 * On reproduit l'état immédiatement après
		 * la victoire contre Taurus.
		 *
		 * processDialogFight() applique normalement
		 * cette progression en entrant dans fight_win.
		 */
		await setIntroProgression(user.id, 6);
		await expect(
			startDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'intro_falls_taurus'
			})
		).rejects.toMatchObject({
			code: 'dialogNotAvailable'
		});
		/*
		 * Le dialogue normal n'est plus disponible :
		 *
		 * cond = scenario(intro, 5)
		 *
		 * Mais une continuation post-combat doit être
		 * proposée.
		 */
		const dialogsAfterFight = await listAvailableDialogs({
			userId: user.id,
			dinozId: dinoz.id
		});
		expect(dialogsAfterFight).toContainEqual(
			expect.objectContaining({
				id: 'intro_falls_taurus',
				resumePhaseId: 'fight_win'
			})
		);
		/*
		 * Le joueur ferme le dialogue puis revient.
		 *
		 * Il doit pouvoir reprendre directement
		 * à fight_win sans relancer le combat.
		 */
		const resumed = await resumeDialogPhase({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'intro_falls_taurus',
			phaseId: 'fight_win'
		});
		expect(resumed.phaseId).toBe('fight_win');
		expect(resumed.actions.startFight).toBeUndefined();
		/*
		 * fight_win
		 *     ↓
		 *    ouf
		 */
		const ouf = await selectDialogLink({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'intro_falls_taurus',
			phaseId: 'fight_win',
			linkId: 'ouf'
		});
		expect(ouf.phaseId).toBe('ouf');
		/*
		 * Le joueur pourrait également quitter ici.
		 *
		 * Le dialogue doit toujours être disponible
		 * en tant que continuation post-combat.
		 */
		const dialogsAfterOuf = await listAvailableDialogs({
			userId: user.id,
			dinozId: dinoz.id
		});
		expect(dialogsAfterOuf).toContainEqual(
			expect.objectContaining({
				id: 'intro_falls_taurus',
				resumePhaseId: 'fight_win'
			})
		);
		/*
		 * ouf
		 *  ↓
		 * move
		 *
		 * move déplace le groupe à Dinoville.
		 */
		const move = await selectDialogLink({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'intro_falls_taurus',
			phaseId: 'ouf',
			linkId: 'move'
		});
		expect(move.phaseId).toBe('move');
		/*
		 * Le déplacement final doit réellement
		 * avoir été appliqué.
		 */
		const movedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			},
			select: {
				placeId: true
			}
		});
		expect(movedDinoz.placeId).toBe(PlaceEnum.DINOVILLE);
		/*
		 * Une fois le dialogue lu entièrement,
		 * Taurus ne doit plus apparaître.
		 */
		const dialogsAfterCompletion = await listAvailableDialogs({
			userId: user.id,
			dinozId: dinoz.id
		});
		expect(dialogsAfterCompletion.some(dialog => dialog.id === 'intro_falls_taurus')).toBe(false);
	});

	it('rejects Taurus post-fight resume without server-side victory proof', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CHUTES_MUTANTES
		});
		await setIntroProgression(user.id, 5);
		await expect(
			resumeDialogPhase({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'intro_falls_taurus',
				phaseId: 'fight_win'
			})
		).rejects.toThrow('Dialog fight continuation "intro_falls_taurus:fight_win" has not been completed');
	});
});
