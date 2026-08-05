/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-be/src/dao/dinozStatusDao.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-04-24.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { prisma } from '../../prisma.js';

export async function addStatusToDinoz(dinozId: number, statusId: number) {
	await prisma.dinozStatus.upsert({
		where: {
			statusId_dinozId: {
				statusId,
				dinozId
			}
		},
		update: {},
		create: {
			statusId,
			dinozId
		}
	});
}

export async function addMultipleStatusToDinoz(dinozId: number, statusIds: number[]) {
	await prisma.dinozStatus.createMany({
		data: statusIds.map(statusId => ({
			dinozId,
			statusId
		}))
	});
}

export async function removeStatusFromDinoz(dinozId: number, statusId: number) {
	await prisma.dinozStatus.delete({
		where: { statusId_dinozId: { dinozId, statusId } }
	});
}

export async function removeAllStatusFromDinoz(dinozId: number) {
	await prisma.dinozStatus.deleteMany({
		where: { dinozId: dinozId }
	});
}
