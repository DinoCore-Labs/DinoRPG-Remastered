import { prisma } from '../../prisma.js';

export async function addSkillToDinoz(dinozId: number, skillId: number /*event?: GameDinozUsage*/) {
	/*if (event) {
		await prisma.dinozSkill.create({
			data: {
				gameDinozId: dinozId,
				skillId
			}
		});
	} else {*/
	await prisma.dinozSkills.create({
		data: {
			dinozId,
			skillId
		}
	});
	//}
}

export async function removeSkillFromDinoz(dinozId: number, skillId: number) {
	await prisma.dinozSkills.delete({
		where: { skillId_dinozId: { dinozId, skillId } }
	});
}
