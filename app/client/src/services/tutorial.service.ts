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

export const TutorialService = {
	getCurrent(): Promise<TutorialResponse | null> {
		return api.get('/tutorial/current');
	}
};
