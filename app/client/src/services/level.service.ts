import type { DinozSkillOwnAndUnlockable } from '@dinorpg/core/models/skills/dinozSkillOwnAndUnlockable.js';
import type { LearnSkillData } from '@dinorpg/core/models/skills/learnSkillData.js';

import { http } from '../utils/http';

export const LevelService = {
	async levelUp(dinozId: number, tryNumber: string): Promise<DinozSkillOwnAndUnlockable> {
		return http()
			.get(`/level/learnableskills/${dinozId}/${tryNumber}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async learnSkill(dinozId: number, skillIdList: Array<number>, tryNumber: number): Promise<LearnSkillData> {
		return http()
			.post(`/level/learnskill/${dinozId}`, {
				skillIdList: skillIdList,
				tryNumber: tryNumber
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
