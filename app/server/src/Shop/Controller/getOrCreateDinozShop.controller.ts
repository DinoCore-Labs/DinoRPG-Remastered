import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { prisma } from '../../prisma.js';
import { getRandomLetter, getRandomNumber } from '../../utils/dinoz/displayDinoz.js';

type DinozShopEntry = {
	id: string;
	race: number;
	display: string;
};

function formatDinozShop(
	rows: {
		id: number;
		raceId: number;
		display: string;
	}[]
): DinozShopEntry[] {
	return rows
		.map(row => ({
			id: row.id.toString(),
			race: row.raceId,
			display: row.display
		}))
		.sort((a, b) => Number(a.id) - Number(b.id));
}

const BASE_DINOZ_SHOP_RACES: RaceEnum[] = [
	RaceEnum.WINKS,
	RaceEnum.SIRAIN,
	RaceEnum.CASTIVORE,
	RaceEnum.NUAGOZ,
	RaceEnum.GORILLOZ,
	RaceEnum.WANWAN,
	RaceEnum.PLANAILLE,
	RaceEnum.MOUEFFE,
	RaceEnum.PIGMOU
];

const REWARD_DINOZ_SHOP_RACES: Partial<Record<Reward, RaceEnum>> = {
	[Reward.ROCKY]: RaceEnum.ROCKY,
	[Reward.HIPPO]: RaceEnum.HIPPOCLAMP,
	[Reward.PTEROZ]: RaceEnum.PTEROZ,
	[Reward.QUETZU]: RaceEnum.QUETZU
};

export function getAvailableDinozShopRaces(rewardIds: readonly number[]): DinozRace[] {
	const raceIds = new Set<RaceEnum>(BASE_DINOZ_SHOP_RACES);
	for (const rewardId of rewardIds) {
		const raceId = REWARD_DINOZ_SHOP_RACES[rewardId as Reward];
		if (raceId !== undefined) {
			raceIds.add(raceId);
		}
	}
	return [...raceIds].map(raceId => raceList[raceId]);
}

function createDinozShopData(userId: string, availableRaces: DinozRace[]): Prisma.UserDinozShopCreateManyInput[] {
	const dinozArray: Prisma.UserDinozShopCreateManyInput[] = [];
	for (let index = 0; index < gameConfig.shop.dinozNumber; index++) {
		const randomRace = availableRaces[getRandomNumber(0, availableRaces.length)];
		let randomDisplay = randomRace.swfLetter;
		for (let letterIndex = 0; letterIndex < 11; letterIndex++) {
			randomDisplay += getRandomLetter('z');
		}
		randomDisplay += '000';
		dinozArray.push({
			userId,
			raceId: randomRace.raceId,
			display: randomDisplay
		});
	}
	return dinozArray;
}

export async function getOrCreateDinozShop(userId: string): Promise<DinozShopEntry[]> {
	return prisma.$transaction(async tx => {
		/*
		 * Serialize Dinoz-shop generation for this user.
		 *
		 * If several requests arrive concurrently,
		 * only one transaction can hold this row lock.
		 */
		const lockedUser = await tx.$queryRaw<Array<{ id: string }>>`
			SELECT "id"
			FROM "User"
			WHERE "id" = ${userId}::uuid
			FOR UPDATE
		`;
		if (lockedUser.length !== 1) {
			throw new ExpectedError(`User ${userId} doesn't exist.`);
		}
		/*
		 * IMPORTANT:
		 * Read the shop AFTER acquiring the lock.
		 *
		 * A concurrent request may have generated
		 * the shop while this transaction was waiting.
		 */
		const user = await tx.user.findUnique({
			where: {
				id: userId
			},
			select: {
				id: true,
				dinozShop: {
					select: {
						id: true,
						raceId: true,
						display: true
					}
				},
				rewards: {
					select: {
						rewardId: true
					}
				}
			}
		});
		if (!user) {
			throw new ExpectedError(`User ${userId} doesn't exist.`);
		}
		/*
		 * Shop already generated:
		 * return the persisted selection.
		 */
		if (user.dinozShop.length > 0) {
			return formatDinozShop(user.dinozShop);
		}
		const availableRaces = getAvailableDinozShopRaces(user.rewards.map(reward => reward.rewardId));
		const dinozArray = createDinozShopData(userId, availableRaces);
		await tx.userDinozShop.createMany({
			data: dinozArray
		});
		/*
		 * Read the persisted rows instead of
		 * returning our generated input.
		 *
		 * We therefore return the real DB IDs.
		 */
		const created = await tx.userDinozShop.findMany({
			where: {
				userId
			},
			orderBy: {
				id: 'asc'
			},
			select: {
				id: true,
				raceId: true,
				display: true
			}
		});
		return formatDinozShop(created);
	});
}
