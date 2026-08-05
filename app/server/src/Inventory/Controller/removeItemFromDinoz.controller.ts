/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-be/src/dao/dinozItemDao.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { prisma } from '../../prisma.js';

export async function removeItemFromDinoz(dinozId: number, itemId: number) {
	const item = await prisma.dinozItems.findFirst({
		where: {
			itemId,
			dinozId
		},
		select: {
			id: true
		}
	});

	if (!item) {
		return;
	}

	await prisma.dinozItems.delete({
		where: { id: item.id }
	});
}
