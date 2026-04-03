import type { DialogPnj } from './dialog.js';

export type DialogResponseLink = {
	id: string;
	text: string;
	confirm: boolean;
};

export type I18nKey = string;

export type DialogPhaseResponse = {
	dialogId: string;
	phaseId: string;
	name: I18nKey;
	text: I18nKey;
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
