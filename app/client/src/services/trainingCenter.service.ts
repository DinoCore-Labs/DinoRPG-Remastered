import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { TrainingCenterProgramKey } from '@dinorpg/core/models/trainingCenter/trainingCenter.js';

import { api } from '../utils/http';

export const TrainingCenterService = {
	startTrainingCenterFight(dinozId: number, program: TrainingCenterProgramKey): Promise<FightResult> {
		return api.post<FightResult>(`/cef/${dinozId}/training-center/start`, { program });
	}
};
