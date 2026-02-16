import { prisma } from '../../prisma.js';

export async function removeUnlockableSkillsFromDinoz(dinozId: number, skillId: number[] /*event?: GameDinozUsage*/) {
	/*if (event) {
		await prisma.dinozSkillUnlockable.deleteMany({
			where: { gameDinozId: dinozId, skillId: { in: skillId } }
		});
	} else {*/
	await prisma.dinozSkillsUnlockable.deleteMany({
		where: { dinozId: dinozId, skillId: { in: skillId } }
	});
	//}
}
