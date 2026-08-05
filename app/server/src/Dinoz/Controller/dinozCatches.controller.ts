/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-be/src/dao/dinozCatchDao.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-03-01.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Monster } from '@dinorpg/core/models/monster/monsterList.js';

import { prisma } from '../../prisma.js';

export function createCatch(dinozId: number, monsterId: Monster, hp: number) {
	return prisma.dinozCatch.create({
		data: {
			dinozId,
			monsterId,
			hp
		}
	});
}

export async function updateCatch(id: number, hp: number) {
	await prisma.dinozCatch.update({
		where: { id },
		data: { hp }
	});
}

export async function removeCatch(id: number) {
	await prisma.dinozCatch.delete({
		where: { id }
	});
}
