import { Prisma } from '../../../../prisma/index.js';

/**
 * Le chantier terminé appartient au clan, pas au joueur ni au Dinoz.
 * L'appartenance actuelle est relue pour éviter de conserver les droits
 * du clan précédent après un départ ou un changement de clan.
 */
export async function getCompletedClanActionKeys(
	tx: Pick<Prisma.TransactionClient, 'clanMember' | 'clanActionProgress'>,
	userId: string
): Promise<string[]> {
	const membership = await tx.clanMember.findUnique({
		where: { userId },
		select: { clanId: true }
	});
	if (!membership) {
		return [];
	}
	const completed = await tx.clanActionProgress.findMany({
		where: { clanId: membership.clanId, completedAt: { not: null } },
		select: { actionKey: true }
	});
	return completed.map(action => action.actionKey);
}
