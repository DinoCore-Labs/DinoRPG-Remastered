import { RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { buildDialogContext } from '../../Dialog/Controller/dialog.context.js';
import { getDialogById } from '../../Dialog/Controller/dialog.registry.js';
import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { prisma } from '../../prisma.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { checkDialogCondition } from '../../utils/conditions/checkDialogCondition.js';
import { isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { ProcessDialogFightInput } from '../Schema/fightDialog.schema.js';
import { calculateFightVsMonsters, rewardFight } from './fight.service.js';

function getDialogPhase(dialogId: string, phaseId: string): RuntimeDialogPhase {
	const dialog = getDialogById(dialogId);
	const phase = dialog.phases[phaseId];

	if (!phase) {
		throw new ExpectedError(`Unknown phase "${phaseId}" in dialog "${dialogId}"`);
	}

	return phase;
}

function extractStartFightMonsters(phase: RuntimeDialogPhase): MonsterFiche[] {
	for (const special of phase.special) {
		if (special.type === 'startFight') {
			return special.fightId;
		}
	}

	throw new ExpectedError(`Phase "${phase.id}" does not start a fight`);
}

export async function processDialogFight(req: FastifyRequest<{ Body: ProcessDialogFightInput }>, reply: FastifyReply) {
	const { dinozId, dialogId, phaseId } = req.body;
	const authed = req.user;

	const dialog = getDialogById(dialogId);
	const phase = getDialogPhase(dialogId, phaseId);

	const context = await prisma.$transaction(tx =>
		buildDialogContext(tx, {
			userId: authed.id,
			dinozId,
			dialog
		})
	);

	if (dialog.cond && !checkDialogCondition(dialog.cond, context)) {
		throw new ExpectedError(`Dialog "${dialog.id}" is not available`);
	}

	const monsters = extractStartFightMonsters(phase);

	// Get Dinoz info
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

	// Remove unavailable followers from team
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

	// Special dialog fight
	const fightResult = calculateFightVsMonsters(team, user, dinozData.placeId, monsters);
	const result = await rewardFight(team, monsters, fightResult, dinozData.placeId, user);

	// Consume fight action
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

	return reply.send(result);
}
