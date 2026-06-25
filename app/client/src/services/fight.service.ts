import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';

import { api } from '../utils/http';

export const FightService = {
	processFight(dinozId: number, autoReequip?: boolean): Promise<FightResult> {
		return api.put<FightResult>(`/fight/${dinozId}`, {
			dinozId,
			autoReequip
		});
	},
	processDialogFight(dinozId: number, dialogId: string, phaseId: string): Promise<FightResult> {
		return api.put<FightResult>('/fight/dialog', {
			dinozId,
			dialogId,
			phaseId
		});
	}
};
