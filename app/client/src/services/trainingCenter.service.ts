import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { TrainingCenterProgramKey } from '@dinorpg/core/models/trainingCenter/trainingCenter.js';

import { http } from '../utils/http';

export const TrainingCenterService = {
	async startTrainingCenterFight(dinozId: number, program: TrainingCenterProgramKey): Promise<FightResult> {
		return http()
			.post(`/cef/${dinozId}/training-center/start`, { program })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
