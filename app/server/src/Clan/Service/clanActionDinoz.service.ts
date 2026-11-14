import { Action, type ActionFiche, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';

import { prisma } from '../../prisma.js';
import { listClanActions } from './clanAction.service.js';

/**
 * Les actions du clan ne sont visibles que sur le lieu prévu par MT et
 * après avoir débloqué l'étape correspondante du scénario.
 * La progression affichée est commune à tous les membres du clan actuel.
 */
export async function getAvailableClanActionsForDinoz(userId: string, placeId: number): Promise<ActionFiche[]> {
	const membership = await prisma.clanMember.findUnique({
		where: { userId },
		select: { clanId: true }
	});
	if (!membership) return [];

	const actions = await listClanActions(userId, membership.clanId);
	return actions
		.filter(action => action.available && action.placeId === placeId)
		.map(action => ({
			...actionList[Action.CLAN_ACTION],
			prop: action.actionKey,
			clanAction: {
				clanId: action.clanId,
				actionKey: action.actionKey,
				progress: action.progress,
				total: action.total,
				percentage: action.percentage,
				completed: action.completed
			}
		}));
}
