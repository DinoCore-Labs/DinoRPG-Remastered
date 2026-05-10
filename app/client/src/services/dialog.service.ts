import type { DialogPhaseResponse } from '@dinorpg/core/models/dialogs/dialogResponse.js';

import { api } from '../utils/http.js';

export type AvailableDialogSummary = {
	id: string;
	name: string;
	place: number;
	pnj: {
		gfx: string;
		image: boolean;
		frame: string;
		background: string;
	};
};

export const DialogService = {
	getAvailableDialogs(dinozId: number): Promise<AvailableDialogSummary[]> {
		return api.get<AvailableDialogSummary[]>('/dialog', {
			params: { dinozId }
		});
	},
	startDialog(dinozId: number, dialogId: string): Promise<DialogPhaseResponse> {
		return api.post<DialogPhaseResponse>(`/dialog/${dialogId}/start`, undefined, {
			params: { dinozId }
		});
	},
	resumeDialog(dinozId: number, dialogId: string, phaseId: string): Promise<DialogPhaseResponse> {
		return api.post<DialogPhaseResponse>(
			`/dialog/${dialogId}/resume`,
			{ phaseId },
			{
				params: { dinozId }
			}
		);
	},
	selectDialogLink(dinozId: number, dialogId: string, linkId: string, phaseId: string): Promise<DialogPhaseResponse> {
		return api.post<DialogPhaseResponse>(
			`/dialog/${dialogId}/links/${linkId}`,
			{ phaseId },
			{
				params: { dinozId }
			}
		);
	}
};
