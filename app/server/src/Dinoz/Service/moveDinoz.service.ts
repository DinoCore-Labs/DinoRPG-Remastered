import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { TemporaryStatus } from '@dinorpg/core/models/enums/TemporaryStatus.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { placeList, SWAMP_FLOODED_DAYS } from '@dinorpg/core/models/place/placeList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { actualPlace } from '@dinorpg/core/utils/dinozUtils.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { fightMonstersAtPlace } from '../../Fight/Service/fight.service.js';
import { movementListener } from '../../Fight/Service/movementListener.service.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { canGoToThisPlace, isAlive } from '../../utils/dinoz/dinozFiche.mapper.js';
import { PlayerForConditionCheck } from '../../utils/user/userConditionCheck.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../Controller/dinozStatus.controller.js';
import { getDinozFightDataRequest } from '../Controller/getDinozFight.controller.js';
import { updateDinoz, updateMultipleDinoz } from '../Controller/updateDinoz.controller.js';
import type { MoveDinozInput, MoveDinozResponse } from '../Schema/dinoz.schema.js';

type Req = FastifyRequest<{ Body: MoveDinozInput }>;

export async function moveDinozHandler(req: Req, reply: FastifyReply) {
	const { dinozId, placeId } = req.body;

	const authedId = req.user.id;

	const dayOfWeek = new Date().getDay();

	const user = await getDinozFightDataRequest(dinozId, authedId);
	if (!user) throw new ExpectedError('userNotFound', { params: { authedId } });

	const dinoz = user.dinoz.find(d => d.id === dinozId);
	if (!dinoz) throw new ExpectedError('dinozNotFound', { params: { dinozId } });

	if (dinoz.canRename) throw new ExpectedError(`Dinoz has to be named`);

	if (dinoz.leaderId) {
		throw new ExpectedError('notLeader', { params: { dinozId } });
	}

	let team = user.dinoz;

	// Go through followers and make those that are unavailable leave the group.
	const unavailableFollowers = team.filter(d => d.life <= 0 || d.state !== null);

	if (unavailableFollowers.length > 0) {
		for (const d of unavailableFollowers) {
			await updateDinoz(d.id, { leader: { disconnect: true } });
		}
		team = team.filter(d => d.life > 0 && d.state === null);
	}

	for (const dinozData of team) {
		//Remove temporary status
		const tempStatus = dinozData.status.filter(r => r.statusId in TemporaryStatus);
		if (tempStatus.length > 0) {
			const promises = tempStatus.map(r => removeStatusFromDinoz(dinozData.id, r.statusId));
			await Promise.all(promises);
		}
	}

	/*if (dinoz.concentration) {
		throw new ExpectedError('concentration', { params: { dinozId } });
	}*/

	if (team.some(d => !d.fight)) {
		throw new ExpectedError('missingIrma', { params: { dinozId } });
	}

	if (!isAlive(dinoz)) {
		throw new ExpectedError('dead', { params: { dinozId } });
	}

	const currentPlace = actualPlace(dinoz);
	const desiredPlace = Object.values(placeList).find(p => p.placeId === placeId);

	if (!desiredPlace) throw new ExpectedError(`Dinoz ${dinozId} want to go in the void`);
	if (currentPlace.placeId === desiredPlace.placeId) {
		throw new ExpectedError(`Dinoz ${dinozId} is already at ${currentPlace.name}`);
	}
	if (!currentPlace.borderPlace.includes(desiredPlace.placeId)) {
		throw new ExpectedError(`${currentPlace.name} is not adjacent with ${desiredPlace.name}`);
	}

	// Check if condition to go to desired place are fulfilled for dinoz and followers
	if (desiredPlace.conditions) {
		for (const member of team) {
			const memberToTest: PlayerForConditionCheck = {
				id: user.id,
				items: user.items,
				rewards: user.rewards,
				//quests: user.quests,
				ranking: user.ranking,
				dinoz: [member]
			};
			if (!canGoToThisPlace(memberToTest, desiredPlace.conditions, member.id)) {
				throw new ExpectedError('missingStatus');
			}
		}
	}

	// If dinoz leave the map, replace by the good place
	const finalPlace = desiredPlace.alias ?? desiredPlace.placeId;

	// Marais Collant - No movement days.
	if (SWAMP_FLOODED_DAYS.includes(dayOfWeek) && currentPlace.placeId === PlaceEnum.MARAIS_COLLANT) {
		if (!dinoz.status.some(s => s.statusId === DinozStatusId.WEIRD_SWAMP_SEEN)) {
			await addStatusToDinoz(dinoz.id, DinozStatusId.WEIRD_SWAMP_SEEN);
		}
		throw new ExpectedError('noMovement', { params: { placeName: currentPlace.name } });
	}

	let fight = await movementListener(user, team, finalPlace, dinozId);
	if (!fight) {
		fight = await fightMonstersAtPlace(team, finalPlace, user);
		if (fight.result) {
			await updateMultipleDinoz(
				team.map(d => d.id),
				{ placeId: finalPlace }
			);

			/*await createLogForMultipleDinoz(
				LogType.Move,
				player.id,
				team.map(d => d.id),
				finalPlace.toString()
			);*/
		}
	}
	// Consume fight action
	for (const dino of team) {
		await updateDinoz(dino.id, {
			fight: false
		});
	}
	// Increment move stat
	await incrementUserStat(StatTracking.MOVES, authedId, 1);
	// Increment kill stat if monsters were killed
	await incrementUserStat(
		StatTracking.KILL_M,
		user.id,
		fight.fighters.filter(f => f.type === FighterType.MONSTER).length
	);

	return fight;
}
