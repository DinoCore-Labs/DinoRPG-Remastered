import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function addMultipleSkillToDinoz(dinozId: number, skillIds: number[] /*, event?: GameDinozUsage*/) {
	await prisma.dinozSkills.createMany({
		data: skillIds.map(skillId => ({
			dinozId,
			skillId
		}))
	});
}

export async function addMultipleUnlockableSkills(skills: Prisma.DinozSkillsUnlockableCreateManyInput[]) {
	await prisma.dinozSkillsUnlockable.createMany({
		data: skills
	});
}

export async function removeAllSkillFromDinoz(dinozId: number) {
	await prisma.dinozSkills.deleteMany({
		where: { dinozId: dinozId }
	});
}

export async function removeAllUnlockableSkillsFromDinoz(dinozId: number) {
	await prisma.dinozSkillsUnlockable.deleteMany({
		where: { dinozId: dinozId }
	});
}
