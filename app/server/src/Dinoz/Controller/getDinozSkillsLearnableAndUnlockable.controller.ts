import { prisma } from '../../prisma.js';

type DinozSkillQueryDb = Pick<typeof prisma, 'dinoz'>;

export async function getDinozSkillsLearnableAndUnlockable(dinozId: number, db: DinozSkillQueryDb = prisma) {
	return db.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			raceId: true,
			skills: {
				select: {
					skillId: true
				}
			},
			unlockableSkills: {
				select: {
					skillId: true
				}
			},
			status: {
				select: {
					statusId: true
				}
			}
		}
	});
}
