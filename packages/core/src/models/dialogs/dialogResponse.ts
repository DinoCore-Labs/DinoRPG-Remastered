import type { DialogPnj } from './dialog.js';

export type DialogResponseLink = {
	id: string;
	text: string;
	confirm: boolean;
};

export type DialogPhaseResponse = {
	dialogId: string;
	phaseId: string;
	name: string;
	text: string;
	fast: boolean;
	pnj: DialogPnj;
	links: DialogResponseLink[];
	actions: {
		startFight?: boolean;
		popup?: boolean;
		statusKey?: string;
		url?: string;
	};
};
