import { prisma } from '../../prisma.js';

type DinozSkillDb = Pick<typeof prisma, 'dinozSkills'>;

export async function addSkillToDinoz(dinozId: number, skillId: number, state = true, db: DinozSkillDb = prisma) {
	await db.dinozSkills.upsert({
		where: {
			skillId_dinozId: {
				dinozId,
				skillId
			}
		},
		create: {
			dinozId,
			skillId,
			state
		},
		update: {}
	});
}

export async function removeSkillFromDinoz(dinozId: number, skillId: number, db: DinozSkillDb = prisma) {
	await db.dinozSkills.delete({
		where: {
			skillId_dinozId: {
				dinozId,
				skillId
			}
		}
	});
}
