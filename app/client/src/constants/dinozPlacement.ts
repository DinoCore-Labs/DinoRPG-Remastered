/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/constants/dinozPlacement.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export const dinozPlacement: Placement = {
	noFliped: {
		0: {
			baby: {
				top: 50,
				left: 47
			},
			adult: {
				top: 20,
				left: 22
			}
		},
		1: {
			baby: {
				top: 40,
				left: 60
			},
			adult: {
				top: 30,
				left: 65
			}
		}
	},
	fliped: {
		0: {
			baby: {
				top: 60,
				left: 137
			},
			adult: {
				top: 30,
				left: 162
			}
		},
		1: {
			baby: {
				top: 60,
				left: 130
			},
			adult: {
				top: 30,
				left: 130
			}
		}
	}
};

export interface Placement {
	noFliped: {
		[race: string]: {
			baby: {
				top: number;
				left: number;
			};
			adult: {
				top: number;
				left: number;
			};
		};
	};
	fliped: {
		[race: string]: {
			baby: {
				top: number;
				left: number;
			};
			adult: {
				top: number;
				left: number;
			};
		};
	};
}
