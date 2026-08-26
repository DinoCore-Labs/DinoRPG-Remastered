import { RuntimeDialog, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';
import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { buildDialogContext } from '../../Dialog/Controller/dialog.context.js';
import { applyDialogPhaseEffects } from '../../Dialog/Controller/dialog.effects.js';
import { getDialogById } from '../../Dialog/Controller/dialog.registry.js';
import {
	getDialogFightLockStatusKey,
	getDialogReturnStatusKeys,
	resolveDialogReturnPhase
} from '../../Dialog/Controller/dialogReturnPhase.controller.js';
import { addStatusToDinoz } from '../../Dinoz/Controller/dinozStatus.controller.js';
import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { prisma } from '../../prisma.js';
import { processMagnetiteFinalAssault } from '../../Scenario/Controller/magnetiteScenario.controller.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { checkDialogCondition } from '../../utils/conditions/checkDialogCondition.js';
import { isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { ProcessDialogFightInput } from '../Schema/fightDialog.schema.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from './fight.service.js';

const MAGNETITE_FINAL_ASSAULT_DIALOG_ID = 'magnetite_citadel_guard_assault';

function getDialogFightPhase(dialog: RuntimeDialog, phaseId: string): RuntimeDialogPhase {
	const phase = dialog.phases[phaseId];
	if (!phase) {
		throw new ExpectedError(`Unknown phase "${phaseId}" in dialog "${dialog.id}"`);
	}
	return phase;
}

function resolveDialogMonster(key: string): MonsterFiche {
	const monster = (monsterByKey as Readonly<Record<string, MonsterFiche>>)[key];
	if (!monster) {
		throw new ExpectedError(`Unknown dialog monster key "${key}"`);
	}
	return monster;
}

function extractDialogFightData(phase: RuntimeDialogPhase): {
	monsters: MonsterFiche[];
	allies: MonsterFiche[];
	rewardStatusKey?: string;
} {
	let monsters: MonsterFiche[] | null = null;
	let allies: MonsterFiche[] = [];
	let rewardStatusKey: string | undefined;
	for (const special of phase.special) {
		if (special.type === 'startFight') {
			monsters = special.fightId;
			allies = [];
		}
		if (special.type === 'fightGroup' || special.type === 'fight') {
			monsters = special.monsters.map(resolveDialogMonster);
			allies = special.friends.map(resolveDialogMonster);
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
		allies,
		rewardStatusKey
	};
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
	const { monsters, allies, rewardStatusKey } = extractDialogFightData(phase);
	const isMagnetiteFinalAssault = dialogId === MAGNETITE_FINAL_ASSAULT_DIALOG_ID && phaseId === 'fight';
	/**
	 * Le combat final Magnétite ne possède volontairement
	 * aucune phase fight_win.
	 *
	 * En cas de victoire, le scénario passe à magnet = 11,
	 * puis le joueur doit parler manuellement au Capitaine.
	 */
	const returnPhaseId = isMagnetiteFinalAssault ? undefined : resolveDialogReturnPhase(phaseId, true);
	const returnPhase = returnPhaseId ? getDialogFightPhase(dialog, returnPhaseId) : undefined;
	const returnStatusKeys = getDialogReturnStatusKeys(returnPhase);
	const lockStatusKey = isMagnetiteFinalAssault ? undefined : getDialogFightLockStatusKey(phase, returnPhase);
	if (lockStatusKey) {
		const lockStatusId = dinozStatusIdByKey[lockStatusKey];
		if (lockStatusId == null) {
			throw new ExpectedError(`Unknown dialog fight lock status "${lockStatusKey}"`);
		}
		if (context.dinoz.statusIds.has(lockStatusId)) {
			throw new ExpectedError(`Dialog fight "${dialogId}:${phaseId}" has already been completed.`);
		}
	}
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
	if (!isAlive(dinozData)) {
		throw new ExpectedError('dead');
	}
	/**
	 * Traitement particulier du combat final Magnétite.
	 *
	 * Contrairement aux combats de dialogue classiques,
	 * ce combat utilise le meneur et ses suiveurs.
	 */
	if (isMagnetiteFinalAssault) {
		const followers = user.dinoz.filter(dinoz => dinoz.id !== dinozId);
		/**
		 * Les suiveurs morts ou indisponibles
		 * sont retirés du groupe.
		 */
		const unavailableFollowers = followers.filter(dinoz => dinoz.life <= 0 || dinoz.state !== null);
		for (const follower of unavailableFollowers) {
			await updateDinoz(follower.id, {
				leader: {
					disconnect: true
				}
			});
		}
		const availableFollowers = followers.filter(dinoz => dinoz.life > 0 && dinoz.state === null);
		const team = [dinozData, ...availableFollowers];
		const result = await processMagnetiteFinalAssault({
			user,
			team,
			dinozId,
			/**
			 * Le combat se déroule sur place :
			 * aucun déplacement du groupe.
			 */
			fromPlace: dinozData.placeId,
			triggerPlace: dinozData.placeId,
			toPlace: dinozData.placeId,
			autoReequip: false
		});
		if (result.result && (result.monsterKillCount ?? 0) > 0) {
			await incrementUserStat(StatTracking.KILL_M, user.id, result.monsterKillCount ?? 0);
		}
		/**
		 * Aucun dialogReturn.
		 *
		 * Après une victoire, le scénario passe à magnet = 11.
		 * Le joueur devra ensuite parler manuellement au Capitaine.
		 */
		return reply.send(result);
	}
	/**
	 * Traitement générique des autres combats de dialogue.
	 */
	const team = [dinozData];
	const fightResult = calculateFightVsMonsters(team, user, dinozData.placeId, monsters, undefined, allies);
	const result = await rewardFightVsMonsters(team, monsters, fightResult, dinozData.placeId, user);
	const winner = fightResult.outcome === FightOutcome.AttackerWin;
	if (winner && returnPhase) {
		await prisma.$transaction(async tx => {
			const rewardContext = await buildDialogContext(tx, {
				userId: authed.id,
				dinozId,
				dialog
			});
			await applyDialogPhaseEffects(tx, {
				context: rewardContext,
				dialog,
				phase: returnPhase,
				applySpecials: false,
				applyEffects: true
			});
		});
	}
	if (winner && rewardStatusKey && !returnStatusKeys.includes(rewardStatusKey)) {
		const rewardStatusId = dinozStatusIdByKey[rewardStatusKey];
		if (rewardStatusId == null) {
			throw new ExpectedError(`Unknown dialog reward status "${rewardStatusKey}"`);
		}
		const alreadyHasStatus = dinozData.status.some(status => status.statusId === rewardStatusId);
		if (!alreadyHasStatus) {
			await addStatusToDinoz(dinozId, rewardStatusId);
		}
	}
	await incrementUserStat(
		StatTracking.KILL_M,
		user.id,
		fightResult.fighters.filter(f => !f.attacker && f.type === FighterType.MONSTER).length
	);
	return reply.send({
		...result,
		dialogReturn:
			winner && returnPhaseId
				? {
						dialogId,
						phaseId: returnPhaseId
					}
				: undefined
	});
}
