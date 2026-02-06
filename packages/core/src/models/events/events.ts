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
