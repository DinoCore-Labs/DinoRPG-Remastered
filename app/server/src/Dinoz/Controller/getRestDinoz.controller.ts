import { RestHealInfos } from '@dinorpg/core/models/dinoz/dinozRest.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';

import { Prisma } from '../../../../prisma/index.js';
import { calculateHealInfos, calculateRegeneration, ticksFromHours } from '../../utils/dinoz/restDinoz.js';

export async function startRest(tx: Prisma.TransactionClient, dinozId: number) {
	const now = new Date();
	return tx.dinoz.update({
		where: { id: dinozId },
		data: {
			state: 'resting',
			stateTimer: now
		}
	});
}

export async function stopRest(tx: Prisma.TransactionClient, dinozId: number) {
	return tx.dinoz.update({
		where: { id: dinozId },
		data: {
			state: null,
			stateTimer: null
		}
	});
}

// IMPORTANT: le type de retour
export type RestInfos = ReturnType<typeof calculateHealInfos>;

export async function applyRestIfNeeded(tx: Prisma.TransactionClient, dinozId: number): Promise<RestInfos | null> {
	const d = await tx.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			life: true,
			maxLife: true,
			state: true,
			stateTimer: true,
			skills: { select: { skillId: true } },
			user: { select: { priest: true } }
		}
	});

	if (!d || d.state !== 'resting' || !d.stateTimer) return null;

	const skillSet = new Set(d.skills.map(s => s.skillId));

	const regen = calculateRegeneration({
		hasCocon: skillSet.has(Skill.COCON),
		hasRegen: skillSet.has(Skill.REGENERESCENCE),
		hasPhoenixHeart: skillSet.has(Skill.COEUR_DU_PHOENIX),
		isPriest: !!d.user?.priest,
		hasDivineWater: skillSet.has(Skill.EAU_DIVINE)
	});

	// ✅ sécurité: si timer dans le futur, on le traite comme "now"
	const safeTimer = d.stateTimer.getTime() > Date.now() ? new Date() : d.stateTimer;

	let infos = calculateHealInfos({
		life: d.life,
		maxLife: d.maxLife,
		timer: safeTimer,
		regen
	});

	const ticks = ticksFromHours(infos.hours);

	// MT: pas de tick => rien à appliquer, mais infos contient déjà next correct
	if (ticks <= 0 || infos.life <= 0) return infos;

	const newLife = d.life + infos.life;

	// MT: on avance le timer de ticks heures (pas timer = now)
	const newTimer = new Date(safeTimer.getTime() + ticks * 60 * 60 * 1000);

	await tx.dinoz.update({
		where: { id: dinozId },
		data: { life: newLife, stateTimer: newTimer }
	});

	infos = calculateHealInfos({
		life: newLife,
		maxLife: d.maxLife,
		timer: newTimer,
		regen
	});

	return infos;
}
