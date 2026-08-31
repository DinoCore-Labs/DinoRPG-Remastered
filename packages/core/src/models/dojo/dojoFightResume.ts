/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/core/src/models/dojo/dojoFightResume.mts?
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-08-31.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { PlaceEnum } from '../enums/PlaceEnum.js';
import { FighterRecap } from '../fight/fightResult.js';
import { FightStep } from '../fight/fightStep.js';
import { UserToolTip } from '../user/userToolTip.js';

export interface DojoFightResume {
	id: string;
	fighters: FighterRecap[];
	history: FightStep[];
	result: boolean;
	seed: string;
	leftPlayer: UserToolTip;
	rightPlayer: UserToolTip;
	place: PlaceEnum;
	background?: string;
}
