import { prisma } from '../../prisma.js';

export async function getDinozSkillsLearnableAndUnlockable(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			raceId: true,
			skills: { select: { skillId: true } },
			unlockableSkills: { select: { skillId: true } },
			status: { select: { statusId: true } }
		}
	});

	return dinoz;
}
