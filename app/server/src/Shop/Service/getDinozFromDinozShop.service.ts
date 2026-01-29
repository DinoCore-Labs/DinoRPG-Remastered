import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { Prisma } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { prisma } from '../../prisma.js';
import { getRandomLetter, getRandomNumber } from '../../utils/dinoz/displayDinoz.js';

export async function getDinozFromDinozShop(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	// 1) Charger user + shop
	const userData = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			dinozShop: true
		}
	});

	if (!userData) {
		throw new ExpectedError(`User ${userId} doesn't exist.`);
	}

	// 2) Si déjà rempli -> return
	if (userData.dinozShop.length > 0) {
		return userData.dinozShop
			.map(row => ({
				id: row.id.toString(),
				race: row.raceId,
				display: row.display
			}))
			.sort((a, b) => Number(a.id) - Number(b.id));
	}

	// 3) Construire la liste de races disponibles
	const availableRaces: DinozRace[] = [
		raceList[RaceEnum.WINKS],
		raceList[RaceEnum.SIRAIN],
		raceList[RaceEnum.CASTIVORE],
		raceList[RaceEnum.NUAGOZ],
		raceList[RaceEnum.GORILLOZ],
		raceList[RaceEnum.WANWAN],
		raceList[RaceEnum.PLANAILLE],
		raceList[RaceEnum.MOUEFFE],
		raceList[RaceEnum.PIGMOU]
	];

	// 3.1) Lire rewards
	const rewardsData = await prisma.user.findUnique({
		where: { id: userId },
		select: { rewards: { select: { rewardId: true } } }
	});

	if (!rewardsData) {
		throw new ExpectedError(`User ${userId} doesn't exist.`);
	}

	rewardsData.rewards.forEach(r => {
		if (r.rewardId === Reward.ROCKY) availableRaces.push(raceList[RaceEnum.ROCKY]);
		if (r.rewardId === Reward.HIPPO) availableRaces.push(raceList[RaceEnum.HIPPOCLAMP]);
		if (r.rewardId === Reward.PTEROZ) availableRaces.push(raceList[RaceEnum.PTEROZ]);
		if (r.rewardId === Reward.QUETZU) availableRaces.push(raceList[RaceEnum.QUETZU]);
	});

	// 4) Générer les dinoz shop
	const dinozArray: Prisma.UserDinozShopCreateManyInput[] = [];

	for (let i = 0; i < gameConfig.shop.dinozNumber; i++) {
		const randomRace = availableRaces[getRandomNumber(0, availableRaces.length)];

		let randomDisplay = randomRace.swfLetter;
		for (let j = 0; j < 11; j++) randomDisplay += getRandomLetter('z');
		randomDisplay += '000';

		dinozArray.push({
			userId,
			raceId: randomRace.raceId,
			display: randomDisplay
		});
	}

	// 5) Save en DB (même style Promise.all)
	const created = await Promise.all(dinozArray.map(d => prisma.userDinozShop.create({ data: d })));

	return created
		.map(row => ({
			id: row.id.toString(),
			race: row.raceId,
			display: row.display
		}))
		.sort((a, b) => Number(a.id) - Number(b.id));
}
