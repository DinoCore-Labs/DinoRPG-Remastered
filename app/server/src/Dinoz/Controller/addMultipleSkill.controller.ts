import { prisma } from '../../prisma.js';

export async function addMultipleSkillToDinoz(dinozId: number, skillIds: number[] /*, event?: GameDinozUsage*/) {
	/*if (event) {
		await prisma.dinozSkill.createMany({
			data: skillIds.map(skillId => ({
				gameDinozId: dinozId,
				skillId
			}))
		});
	} else {
		await prisma.dinozSkill.createMany({
			data: skillIds.map(skillId => ({
				dinozId,
				skillId
			}))
		});
	}*/
	await prisma.dinozSkills.createMany({
		data: skillIds.map(skillId => ({
			dinozId,
			skillId
		}))
	});
}
