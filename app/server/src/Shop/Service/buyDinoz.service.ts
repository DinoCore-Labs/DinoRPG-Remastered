import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getRace } from '@dinorpg/core/utils/dinozUtils.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import gameConfig from '../../config/game.config.js';
import { addMultipleSkillToDinoz } from '../../Dinoz/Controller/addMultipleSkill.controller.js';
import { createDinoz } from '../../Dinoz/Controller/createDinoz.controller.js';
import { getActiveDinoz } from '../../Dinoz/Controller/getActiveDinoz.js';
import { updateDinozCount } from '../../Ranking/Controller/updateDinozCount.js';
import { updatePoints } from '../../Ranking/Controller/updatePoints.js';
import { removeMoney } from '../../User/Controller/money.controller.js';
import { toDinozFiche, UserForDinozFiche } from '../../utils/dinoz/dinozFiche.mapper.js';
import { initializeDinoz } from '../../utils/dinoz/initializeDinoz.js';
import { deleteDinozInShopRequest } from '../Controller/deleteDinozInShop.controller.js';
import { getDinozShopDetailsRequest } from '../Controller/getDinozShop.controller.js';

type BuyDinozParams = { id: number };

export async function buyDinoz(req: FastifyRequest<{ Params: BuyDinozParams }>, reply: FastifyReply) {
	const userId = req.user.id;
	const dinozId = Number(req.params.id);

	// Check if player can buy more dinoz
	const dinozActive = await getActiveDinoz(userId);

	if (dinozActive.length > 0) {
		const player = dinozActive[0].user;

		if (!player) {
			throw new ExpectedError('userNotFound');
		}

		const maxDinoz = gameConfig.dinoz.maxQuantity; /*+ (player.leader ? 3 : 0) + (player.messie ? 3 : 0)*/
		if (dinozActive.length >= maxDinoz) {
			throw new ExpectedError('tooManyActiveDinoz');
		}
	}

	// Get dinoz details thanks to his ID
	const dinozShopData = await getDinozShopDetailsRequest(dinozId);

	if (!dinozShopData) {
		throw new ExpectedError('dinozNotFound');
	}

	const race = getRace(dinozShopData.raceId);

	// Throw error if dinoz doesn't belong to player shop
	if (!dinozShopData.user || dinozShopData.user.id !== userId) {
		throw new ExpectedError(`Dinoz ${req.params.id} doesn't belong to your account`);
	}

	// Throws an exception if player doesn't have enough money to buy the dinoz
	const gold = dinozShopData.user.wallets[0]?.amount ?? 0;

	if (gold < race.price) {
		throw new ExpectedError('notEnoughMoney');
	}

	const newDinozProps = initializeDinoz(race, dinozShopData.user.id, dinozShopData.display);

	// Set player money
	await removeMoney(dinozShopData.user.id, race.price);

	// Delete all dinoz from dinoz shop
	await deleteDinozInShopRequest(userId);

	// Create a new dinoz that belongs to player
	const dinozCreated = await createDinoz(newDinozProps);
	const newDinoz: UserForDinozFiche = {
		id: userId,
		//engineer: false,
		items: [],
		rewards: [],
		//quests: [],
		ranking: null,
		dinoz: [
			{
				...dinozCreated,
				status: [],
				skills: [],
				//missions: [],
				items: [],
				followers: []
				//concentration: null,
				//TournamentTeam: [],
				//build: null
			}
		]
	};

	const skillsToAdd = Object.values(skillList).filter(
		skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
	);

	// Add base skills to created dinoz
	await addMultipleSkillToDinoz(
		dinozCreated.id,
		skillsToAdd.map(skill => skill.id)
	);

	// Update player points and dinoz count
	await updateDinozCount(userId, 1);
	await updatePoints(userId, 1);

	return toDinozFiche(newDinoz, dinozCreated.id /*, null*/);
}
