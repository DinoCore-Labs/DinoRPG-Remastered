import { BotDinozRole, BotRoleObjective } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { getOrAssignBotDinozRole } from './botDinozRole.service.js';

export type BotRoleObjectiveActivity = 'fight' | 'gather' | 'move' | 'mission' | 'forcebrut' | 'trophy';

export function getBotRoleObjectiveActivityBonus(
	objective: BotRoleObjective | null,
	activity: BotRoleObjectiveActivity
): number {
	switch (objective) {
		case BotRoleObjective.FIGHTER_POWER:
			if (activity === 'forcebrut') return 110;
			if (activity === 'trophy') return 90;
			if (activity === 'fight') return 45;
			if (activity === 'mission') return 15;
			return 0;
		case BotRoleObjective.GATHERER_MERCHANT:
			if (activity === 'gather') return 20;
			if (activity === 'mission') return 15;
			return 0;
		case BotRoleObjective.GATHERER_HARVEST:
			if (activity === 'gather') return 80;
			if (activity === 'mission') return 20;
			return 0;
		case BotRoleObjective.EXPLORER_DISCOVERY:
			if (activity === 'move') return 70;
			if (activity === 'mission') return 40;
			return 0;
		case null:
		default:
			return 0;
	}
}

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
