import type { DinozSkillOwnAndUnlockable } from '@dinorpg/core/models/skills/dinozSkillOwnAndUnlockable.js';
import type { LearnSkillData } from '@dinorpg/core/models/skills/learnSkillData.js';

import { api } from '../utils/http';

export const LevelService = {
	levelUp(dinozId: number, tryNumber: string): Promise<DinozSkillOwnAndUnlockable> {
		return api.get<DinozSkillOwnAndUnlockable>(`/level/learnableskills/${dinozId}/${tryNumber}`);
	},
	learnSkill(dinozId: number, skillIdList: number[], tryNumber: number): Promise<LearnSkillData> {
		return api.post<LearnSkillData>(`/level/learnskill/${dinozId}`, {
			skillIdList,
			tryNumber
		});
	}
};
