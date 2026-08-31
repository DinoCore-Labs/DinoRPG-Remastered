/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/core/src/models/dojo/dojoBasic.mts?
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-08-31.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DinozFiche } from '../dinoz/dinozFiche.js';
import { Challenge } from './challenge.js';
import { DojoChallengeHistory, DojoOpponents, DojoTeam } from './dojoChallenge.js';
import { TournamentTeam } from './tournament.js';

export interface Dojo {
	id: string;
	userId: number;
	activeChallenge: Challenge;
	reputation: number;
	DojoChallengeHistory: Pick<DojoChallengeHistory, 'victory' | 'achieved'>[];
	TournamentTeam?: (TournamentTeam & { teamCount?: number }) | null;
}

export interface myTeam {
	team: (Pick<DojoTeam, 'fighted'> & { dinoz: Pick<DinozFiche, 'id' | 'name' | 'level' | 'display'> })[];
	DojoOpponents: (Pick<DojoOpponents, 'fighted' | 'achieved'> & {
		dinoz: Pick<DinozFiche, 'id' | 'name' | 'level' | 'display'>;
	})[];
	activeChallenge: Challenge | null;
	dailyReset: number;
}
