import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getRace } from '@dinorpg/core/utils/dinozUtils.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { Role } from '../../../../prisma/client.js';
import gameConfig from '../../config/game.config.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { removeItemFromDinoz } from '../../Inventory/Controller/removeItemFromDinoz.controller.js';
import { computeUSkillsForUser } from '../../Level/Controller/applySkillEffect.controller.js';
import { prisma } from '../../prisma.js';
import { updatePoints } from '../../Ranking/Controller/updatePoints.js';
import { removeMoney } from '../../User/Controller/money.controller.js';
import { withUserGameplayLock } from '../../utils/database/userGameplayLock.js';
import { reincarnateDinoz } from '../../utils/dinoz/level.mapper.js';
import {
	removeAllSkillFromDinoz,
	removeAllUnlockableSkillsFromDinoz
} from '../Controller/addMultipleSkill.controller.js';
import { addSkillToDinoz } from '../Controller/addSkillToDinoz.controller.js';
import { addStatusToDinoz, removeAllStatusFromDinoz } from '../Controller/dinozStatus.controller.js';
import { getDinozToReincarnate, removeAllMissionsFromDinoz } from '../Controller/getDinozToReincarnate.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
};

type ReincarnateRequest = FastifyRequest<{
	Params: Params;
	Body: {
		keepSeed?: boolean;
	};
}>;

async function reincarnateUnlocked(req: ReincarnateRequest) {
	const dinozId = +req.params.id;
	const authed = req.user;
	const keepSeed = req.body?.keepSeed ?? false;
	const dinoz = await getDinozToReincarnate(dinozId);
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', {
			params: {
				dinozId
			}
		});
	}
	/*
	 * La réincarnation modifie beaucoup
	 * d'état lié au compte.
	 *
	 * Il est donc indispensable de vérifier
	 * l'ownership avant toute mutation.
	 */
	if (dinoz.userId !== authed.id) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId: authed.id
			}
		});
	}
	if (
		!dinoz.skills.some(s => s.skillId === Skill.REINCARNATION) ||
		dinoz.level < 40 ||
		dinoz.status.some(s => s.statusId === DinozStatusId.REINCARNATION)
	) {
		throw new ExpectedError('reincarnationNotPossible', {
			params: {
				id: dinozId
			}
		});
	}
	const race = getRace(dinoz.raceId);
	const user = await prisma.user.findUnique({
		where: {
			id: authed.id
		},
		select: {
			role: true,
			keepSeedReincarnationCount: true
		}
	});
	if (!user) {
		throw new ExpectedError('userNotFound');
	}
	/*
	 * Toutes les validations prévisibles
	 * doivent avoir lieu AVANT de modifier
	 * équipements, Dinoz ou quota.
	 */
	if (
		keepSeed &&
		user.role !== Role.ADMIN &&
		user.keepSeedReincarnationCount >= gameConfig.dinoz.maxKeepSeedReincarnations
	) {
		throw new ExpectedError('keepSeedReincarnationLimitReached', {
			params: {
				limit: gameConfig.dinoz.maxKeepSeedReincarnations
			}
		});
	}
	if (keepSeed) {
		await removeMoney(authed.id, Math.round(race.price * dinoz.level ** 0.5));
		if (user.role !== Role.ADMIN) {
			await prisma.user.update({
				where: {
					id: authed.id
				},
				data: {
					keepSeedReincarnationCount: {
						increment: 1
					}
				}
			});
		}
	}
	/*
	 * À partir d'ici la réincarnation
	 * est validée.
	 */
	for (const item of dinoz.items) {
		await removeItemFromDinoz(dinoz.id, item.itemId);

		await addItemToInventory(authed.id, item.itemId, 1);
	}
	await updateDinoz(dinoz.id, reincarnateDinoz(race, dinoz.display, keepSeed, dinoz.seed));
	/*
	 * Les anciennes compétences doivent
	 * être supprimées avant de restaurer
	 * les compétences natives de race.
	 */
	await removeAllSkillFromDinoz(dinoz.id);
	const promises: Promise<unknown>[] = [];
	if (race.skillId && race.skillId.length > 0) {
		for (const skill of race.skillId) {
			promises.push(addSkillToDinoz(dinoz.id, skill));
		}
	}
	promises.push(removeAllStatusFromDinoz(dinoz.id));
	promises.push(removeAllMissionsFromDinoz(dinoz.id));
	promises.push(removeAllUnlockableSkillsFromDinoz(dinoz.id));
	promises.push(updatePoints(authed.id, -dinoz.level));
	promises.push(computeUSkillsForUser(authed.id));
	await Promise.all(promises);
	/*
	 * Ce statut empêche une nouvelle
	 * réincarnation du même cycle.
	 */
	await addStatusToDinoz(dinozId, DinozStatusId.REINCARNATION);
}

export async function reincarnate(req: ReincarnateRequest, _reply: FastifyReply) {
	return withUserGameplayLock(req.user.id, () => reincarnateUnlocked(req));
}
