import { BotDinozRole, BotRoleObjective } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { getOrAssignBotDinozRole } from './botDinozRole.service.js';

function getDesiredRoleObjective(role: BotDinozRole, merchantUnlocked: boolean): BotRoleObjective {
	switch (role) {
		case BotDinozRole.FIGHTER:
			return BotRoleObjective.FIGHTER_POWER;
		case BotDinozRole.GATHERER:
			return merchantUnlocked ? BotRoleObjective.GATHERER_HARVEST : BotRoleObjective.GATHERER_MERCHANT;
		case BotDinozRole.EXPLORER:
			return BotRoleObjective.EXPLORER_DISCOVERY;
	}
}

export async function getOrAssignBotRoleObjective(
	userId: string,
	dinozId: number
): Promise<BotRoleObjective | null> {
	const role = await getOrAssignBotDinozRole(userId, dinozId);
	if (!role) return null;

	const dinoz = await prisma.dinoz.findFirst({
		where: {
			id: dinozId,
			userId,
			user: {
				isBot: true
			}
		},
		select: {
			botMemory: {
				select: {
					objective: true
				}
			},
			user: {
				select: {
					merchant: true
				}
			}
		}
	});
	if (!dinoz) return null;

	const desiredObjective = getDesiredRoleObjective(role, dinoz.user.merchant);
	if (dinoz.botMemory?.objective === desiredObjective) {
		return desiredObjective;
	}

	await prisma.botDinozMemory.upsert({
		where: {
			dinozId
		},
		create: {
			dinozId,
			role,
			objective: desiredObjective
		},
		update: {
			role,
			objective: desiredObjective
		}
	});

	return desiredObjective;
}
