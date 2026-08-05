/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-be/src/dao/dinozSkillUnlockableDao.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-17 through 2026-02-17.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { prisma } from '../../prisma.js';

export async function removeUnlockableSkillsFromDinoz(dinozId: number, skillId: number[] /*event?: GameDinozUsage*/) {
	/*if (event) {
		await prisma.dinozSkillUnlockable.deleteMany({
			where: { gameDinozId: dinozId, skillId: { in: skillId } }
		});
	} else {*/
	await prisma.dinozSkillsUnlockable.deleteMany({
		where: { dinozId: dinozId, skillId: { in: skillId } }
	});
	//}
}
