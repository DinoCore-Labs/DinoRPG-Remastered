import { prisma } from '../../prisma.js';

export async function addSkillToDinoz(dinozId: number, skillId: number, state = true) {
	await prisma.dinozSkills.upsert({
		where: {
			skillId_dinozId: {
				dinozId: dinozId,
				skillId: skillId
			}
		},
		create: {
			dinozId: dinozId,
			skillId: skillId,
			state: state
		},
		update: {}
	});
}

export async function removeSkillFromDinoz(dinozId: number, skillId: number) {
	await prisma.dinozSkills.delete({
		where: { skillId_dinozId: { dinozId, skillId } }
	});
}
