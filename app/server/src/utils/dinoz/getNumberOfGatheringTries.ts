import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';

import { DinozSkills } from '../../../../prisma/index.js';

type GatherWithTries = {
	type: GatherType;
	minimumClick: number;
};

export const getNumberOfGatheringTries = (
	dinoz: {
		skills: Pick<DinozSkills, 'skillId'>[];
	},
	gridData: GatherWithTries
) => {
	let click = 0;

	switch (gridData.type) {
		case GatherType.FISH:
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.NEMO].id)) click++;
			break;

		case GatherType.CUEILLE1:
		case GatherType.CUEILLE2:
		case GatherType.CUEILLE3:
		case GatherType.CUEILLE4:
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.LONDUHAUT].id)) click++;
			break;

		case GatherType.ENERGY1:
		case GatherType.ENERGY2:
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.EINSTEIN].id)) click++;
			break;

		case GatherType.HUNT:
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.BENEDICTION_DARTEMIS].id)) click++;
			break;

		case GatherType.SEEK:
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.EXPERT_EN_FOUILLE].id)) click++;
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.PLANIFICATEUR].id)) click++;
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.CHAMPOLLION].id)) click++;
			if (dinoz.skills.some(s => s.skillId === skillList[Skill.GRATTEUR].id)) click++;
			break;

		case GatherType.LABO:
		case GatherType.PARTY:
		case GatherType.XMAS:
		case GatherType.TICTAC:
		case GatherType.ANNIV:
		case GatherType.DAILY:
			break;
	}

	return gridData.minimumClick + click;
};
