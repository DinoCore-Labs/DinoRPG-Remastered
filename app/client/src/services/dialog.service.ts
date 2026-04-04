import type { DialogPhaseResponse } from '@dinorpg/core/models/dialogs/dialogResponse.js';

import { http } from '../utils/http.js';

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
	async getAvailableDialogs(dinozId: number): Promise<AvailableDialogSummary[]> {
		return http()
			.get(`/dialog?dinozId=${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async startDialog(dinozId: number, dialogId: string): Promise<DialogPhaseResponse> {
		return http()
			.post(`/dialog/${dialogId}/start?dinozId=${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async resumeDialog(dinozId: number, dialogId: string, phaseId: string): Promise<DialogPhaseResponse> {
		return http()
			.post(
				`/dialog/${dialogId}/resume`,
				{ phaseId },
				{
					params: { dinozId }
				}
			)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async selectDialogLink(
		dinozId: number,
		dialogId: string,
		linkId: string,
		phaseId: string
	): Promise<DialogPhaseResponse> {
		return http()
			.post(`/dialog/${dialogId}/links/${linkId}?dinozId=${dinozId}`, {
				phaseId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
