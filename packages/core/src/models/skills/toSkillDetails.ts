import { DinozSkillsDTO } from '../dinoz/dinozSkills.js';
import { SkillDetails } from './skillDetails.js';
import { skillList } from './skillList.js';

export const toSkillDetails = (skills: Pick<DinozSkillsDTO, 'skillId' | 'state'>[]): SkillDetails[] =>
	skills.map(skill => {
		const skillFound = Object.values(skillList).find(skillDinoz => skillDinoz.id === skill.skillId);
		if (!skillFound) {
			throw new Error(`Skill ${skill.skillId} doesn't exist.`);
		}

		return {
			...skillFound,
			state: skill.state
		};
	});
