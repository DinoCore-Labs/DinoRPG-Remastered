/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/event/Events.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
export enum GameEvent {
	CHRISTMAS = 'CHRISTMAS',
	VALENTINE = 'VALENTINE'
}

export type EventDetails = {
	name: GameEvent;
	start: {
		month: number;
		day: number;
	};
	end: {
		month: number;
		day: number;
	};
	softCap: number;
};

export const Events: Record<GameEvent, EventDetails> = {
	[GameEvent.CHRISTMAS]: {
		name: GameEvent.CHRISTMAS,
		start: {
			month: 12,
			day: 1
		},
		end: {
			month: 12,
			day: 26
		},
		softCap: 100
	},
	[GameEvent.VALENTINE]: {
		name: GameEvent.VALENTINE,
		start: {
			month: 2,
			day: 13
		},
		end: {
			month: 2,
			day: 15
		},
		softCap: 100
	}
};

export const currentEvents = () => {
	const now = new Date();
	const month = now.getMonth() + 1;
	const day = now.getDate();

	return Object.values(Events).filter(event => {
		const start = event.start;
		const end = event.end;

		if (month > start.month && month < end.month) {
			return true;
		}

		if (month === start.month && month === end.month) {
			return day >= start.day && day <= end.day;
		}

		if (month === start.month) {
			return day >= start.day;
		}

		if (month === end.month) {
			return day <= end.day;
		}

		return false;
	});
	// .map(event => event.name);
};
