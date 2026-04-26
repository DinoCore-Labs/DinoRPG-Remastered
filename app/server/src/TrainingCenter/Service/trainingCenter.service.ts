import {
	getTrainingCenterVirtualLevel,
	TRAINING_CENTER_BACKGROUND,
	TRAINING_CENTER_MAX_LEVEL,
	TRAINING_CENTER_PLACE,
	TRAINING_CENTER_REQUIRED_STATUS,
	trainingCenterPrograms
} from '@dinorpg/core/models/trainingCenter/trainingCenter.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import {
	calculateFightVsMonsters,
	generateMonsterList,
	rewardFightVsMonsters
} from '../../Fight/Service/fight.service.js';
import { removeMoney } from '../../User/Controller/money.controller.js';
import { isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import type { TrainingCenterBodyInput, TrainingCenterParams } from '../Schema/trainingCenter.schema.js';

export async function startTrainingCenter(
	req: FastifyRequest<{
		Params: TrainingCenterParams;
		Body: TrainingCenterBodyInput;
	}>,
	reply: FastifyReply
) {
	const dinozId = req.params.id;
	const authed = req.user;
	const program = trainingCenterPrograms[req.body.program];

	if (!program) {
		throw new ExpectedError('trainingCenter.errors.invalidProgram');
	}

	const user = await getDinozFightDataRequest(dinozId, authed.id);

	if (!user) {
		throw new ExpectedError('userNotFound', {
			params: { id: authed.id }
		});
	}

	const dinoz = user.dinoz.find(entry => entry.id === dinozId);

	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', {
			params: { id: dinozId }
		});
	}

	if (dinoz.canRename) {
		throw new ExpectedError('trainingCenter.errors.dinozMustBeNamed');
	}

	if (dinoz.state !== null) {
		throw new ExpectedError('trainingCenter.errors.unavailable');
	}

	if (!isAlive(dinoz)) {
		throw new ExpectedError('dead');
	}

	if (dinoz.placeId !== TRAINING_CENTER_PLACE) {
		throw new ExpectedError('trainingCenter.errors.wrongPlace');
	}

	if (dinoz.level >= TRAINING_CENTER_MAX_LEVEL) {
		throw new ExpectedError('trainingCenter.errors.levelTooHigh');
	}

	const hasMemberCard = dinoz.status.some(status => status.statusId === TRAINING_CENTER_REQUIRED_STATUS);

	if (!hasMemberCard) {
		throw new ExpectedError('trainingCenter.errors.needMemberCard');
	}

	const currentGold = user.wallets?.[0]?.amount ?? 0;

	if (currentGold < program.price) {
		throw new ExpectedError('trainingCenter.errors.notEnoughGold');
	}

	const team = [dinoz];

	const virtualLevel = getTrainingCenterVirtualLevel(dinoz.level, program);

	const virtualTeam = team.map(fighter => ({
		...fighter,
		level: virtualLevel,
		missions: []
	}));

	const monsters = await generateMonsterList(virtualTeam, TRAINING_CENTER_PLACE);

	const fightResult = calculateFightVsMonsters(team, user, TRAINING_CENTER_PLACE, monsters);

	// Paiement immédiat de la séance, après validation/génération du combat.
	await removeMoney(authed.id, program.price);

	const result = await rewardFightVsMonsters(team, monsters, fightResult, TRAINING_CENTER_PLACE, user, {
		disableGoldReward: true,
		xpMultiplier: program.xpMultiplier
	});

	return reply.send({
		...result,
		source: 'training_center',
		background: TRAINING_CENTER_BACKGROUND,
		trainingProgram: program.key
	});
}
