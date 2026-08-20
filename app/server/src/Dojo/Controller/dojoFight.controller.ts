import { DinozState } from '../../../../prisma/client.js';
import { prisma } from '../../prisma.js';

export async function getDojoFightPreparationRequest(userId: string) {
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			name: true,
			cooker: true,
			dinoz: {
				select: {
					id: true,
					state: true
				}
			}
		}
	});
	return user;
}

const FIGHT_BLOCKING_REASONS: DinozState[] = [DinozState.frozen, DinozState.sacrificed, DinozState.selling];

export function availableDinozIds(dinoz: { id: number; state: DinozState | null }[]): number[] {
	return dinoz.filter(d => !d.state || !FIGHT_BLOCKING_REASONS.includes(d.state)).map(d => d.id);
}
