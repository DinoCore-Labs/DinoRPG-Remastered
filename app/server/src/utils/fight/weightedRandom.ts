/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-be/src/utils/fight/weightedRandom.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const weightedRandom = <T extends { odds: number }>(items: T[]) => {
	const totalOdds = items.reduce((acc, item) => acc + item.odds, 0);
	if (totalOdds === 0) {
		return items[0];
	}
	let i = 0;
	const weights: number[] = [];
	for (i = 0; i < items.length; i++) {
		weights[i] = items[i].odds / totalOdds + (weights[i - 1] || 0);
	}

	const random = Math.random() * weights[weights.length - 1];

	for (i = 0; i < weights.length; i++) {
		if (weights[i] > random) {
			break;
		}
	}

	return items[i];
};

export default weightedRandom;
