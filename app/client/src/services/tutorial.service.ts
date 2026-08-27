import type { TutorialEvent } from '@dinorpg/core/models/tutorial/tutorial.js';

import { api } from '../utils/http';

export type TutorialObjectiveResponse = {
	id: string;
	begin: {
		url?: string;
		fast?: boolean;
		visible?: boolean;
	};
	end: {
		url?: string;
		fast?: boolean;
		visible?: boolean;
	};
	helpers: Array<{
		id: string;
		selector: string;
		url?: string;
	}>;
};

export type TutorialResponse = {
	completed: boolean;
	progression: number;
	objective: TutorialObjectiveResponse | null;
};

export type TutorialClientEvent = Extract<
	TutorialEvent,
	'CLAN_PAGE_VISITED' | 'ACCOUNT_PAGE_VISITED' | 'TUTORIAL_FINISHED'
>;

export const TutorialService = {
	getCurrent(): Promise<TutorialResponse | null> {
		return api.get('/tutorial/current');
	},
	sendEvent(event: TutorialClientEvent): Promise<TutorialResponse | null> {
		return api.post('/tutorial/event', {
			event
		});
	}
};
