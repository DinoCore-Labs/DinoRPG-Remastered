import { RuntimeDialog, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';
import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { buildDialogContext } from '../../Dialog/Controller/dialog.context.js';
import { getDialogById } from '../../Dialog/Controller/dialog.registry.js';
import { addStatusToDinoz } from '../../Dinoz/Controller/dinozStatus.controller.js';
import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { checkDialogCondition } from '../../utils/conditions/checkDialogCondition.js';
import { isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { ProcessDialogFightInput } from '../Schema/fightDialog.schema.js';
import { calculateFightVsMonsters, rewardFight } from './fight.service.js';

function getDialogFightPhase(dialog: RuntimeDialog, phaseId: string): RuntimeDialogPhase {
	const phase = dialog.phases[phaseId];

	if (!phase) {
		throw new ExpectedError(`Unknown phase "${phaseId}" in dialog "${dialog.id}"`);
	}

	return phase;
}

function extractDialogFightData(phase: RuntimeDialogPhase): {
	monsters: MonsterFiche[];
	rewardStatusKey?: string;
} {
	let monsters: MonsterFiche[] | null = null;
	let rewardStatusKey: string | undefined;

	for (const special of phase.special) {
		if (special.type === 'startFight') {
			monsters = special.fightId;
		}

		if (special.type === 'status') {
			rewardStatusKey = special.status;
		}
	}

	if (!monsters || monsters.length === 0) {
		throw new ExpectedError(`Phase "${phase.id}" does not define a dialog fight`);
	}

	return {
		monsters,
		rewardStatusKey
	};
}

function resolveDialogReturnPhase(phaseId: string, won: boolean): string | undefined {
	if (!won) return undefined;

	switch (phaseId) {
		case 'water_fight':
			return 'water_win';
		case 'fire_fight':
			return 'fire_win';
		case 'attack':
			return 'attack_win';
		case 'show':
			return 'show_win';
		case 'fight':
			return 'fight_win';
		default:
			return undefined;
	}
}

export async function processDialogFight(req: FastifyRequest<{ Body: ProcessDialogFightInput }>, reply: FastifyReply) {
	const { dinozId, dialogId, phaseId } = req.body;
	const authed = req.user;

	const dialog = getDialogById(dialogId);
	const phase = getDialogFightPhase(dialog, phaseId);

	const context = await prisma.$transaction(tx =>
		buildDialogContext(tx, {
			userId: authed.id,
			dinozId,
			dialog
		})
	);

	if (context.dinoz.placeId !== dialog.place) {
		throw new ExpectedError(`Dialog "${dialog.id}" is not available at this place`);
	}

	if (dialog.cond && !checkDialogCondition(dialog.cond, context)) {
		throw new ExpectedError(`Dialog "${dialog.id}" is not available`);
	}

	const { monsters, rewardStatusKey } = extractDialogFightData(phase);

	const user = await getDinozFightDataRequest(dinozId, authed.id);
	if (!user) throw new ExpectedError('userNotFound', { params: { id: authed.id } });

	const dinozData = user.dinoz.find(d => d.id === dinozId);
	if (!dinozData) throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });

	if (dinozData.canRename) {
		throw new ExpectedError('Dinoz has to be named.');
	}

	if (dinozData.state !== null) {
		throw new ExpectedError('Dinoz is not able to fight.');
	}

	let team = user.dinoz;

	const unavailableFollowers = team.filter(d => d.life <= 0 || d.state !== null);

	if (unavailableFollowers.length > 0) {
		for (const d of unavailableFollowers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
		team = team.filter(d => d.life > 0 && d.state === null);
	}

	if (!isAlive(dinozData)) {
		throw new ExpectedError('dead');
	}

	const fightResult = calculateFightVsMonsters(team, user, dinozData.placeId, monsters);
	const result = await rewardFight(team, monsters, fightResult, dinozData.placeId, user);

	if (fightResult.winner && rewardStatusKey) {
		const rewardStatusId = dinozStatusIdByKey[rewardStatusKey];

		if (rewardStatusId == null) {
			throw new ExpectedError(`Unknown dialog reward status "${rewardStatusKey}"`);
		}

		const alreadyHasStatus = dinozData.status.some(status => status.statusId === rewardStatusId);

		if (!alreadyHasStatus) {
			await addStatusToDinoz(dinozId, rewardStatusId);
		}
	}

	for (const dino of team) {
		await updateDinoz(dino.id, {
			fight: false
		});
	}

	await incrementUserStat(
		StatTracking.KILL_M,
		user.id,
		fightResult.fighters.filter(f => f.type === FighterType.MONSTER).length
	);

	const returnPhaseId = resolveDialogReturnPhase(phaseId, fightResult.winner);

	return reply.send({
		...result,
		dialogReturn: returnPhaseId
			? {
					dialogId,
					phaseId: returnPhaseId
				}
			: undefined
	});
}
