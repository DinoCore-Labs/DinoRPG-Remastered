/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-be/src/business/dojoService.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-08-31.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DinozState } from '../../../../prisma/client.js';
import { prisma } from '../../prisma.js';

export async function getDojoFightPreparationRequest(userId: string) {
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			name: true,
			cooker: true,
			dinoz: {
				select: {
					id: true,
					state: true
				}
			}
		}
	});
	return user;
}

const FIGHT_BLOCKING_REASONS: DinozState[] = [DinozState.frozen, DinozState.sacrificed, DinozState.selling];

export function availableDinozIds(dinoz: { id: number; state: DinozState | null }[]): number[] {
	return dinoz.filter(d => !d.state || !FIGHT_BLOCKING_REASONS.includes(d.state)).map(d => d.id);
}
