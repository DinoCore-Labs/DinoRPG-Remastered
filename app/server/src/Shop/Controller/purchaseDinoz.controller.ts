import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getRace } from '@dinorpg/core/utils/dinozUtils.js';

import { DinozState, GameLogType, MoneyType } from '../../../../prisma/index.js';
import { getUserMaxDinoz } from '../../Dinoz/Controller/getActiveDinoz.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { initializeDinoz } from '../../utils/dinoz/initializeDinoz.js';

type PurchaseDinozParams = {
	userId: string;
	shopDinozId: number;
};

export async function purchaseDinoz({ userId, shopDinozId }: PurchaseDinozParams) {
	const result = await prisma.$transaction(async tx => {
		/*
		 * Read the selected shop Dinoz.
		 */
		const shopDinoz = await tx.userDinozShop.findUnique({
			where: {
				id: shopDinozId
			},
			select: {
				id: true,
				userId: true,
				raceId: true,
				display: true
			}
		});
		if (!shopDinoz) {
			throw new ExpectedError('dinozNotFound');
		}
		if (shopDinoz.userId !== userId) {
			throw new ExpectedError(`Dinoz ${shopDinozId} doesn't belong to your account`);
		}
		const race = getRace(shopDinoz.raceId);
		/*
		 * Atomic Gold debit.
		 *
		 * This also serializes concurrent Dinoz purchases
		 * made by the same player.
		 */
		const removedGold = await tx.userWallet.updateMany({
			where: {
				userId,
				type: MoneyType.GOLD,
				amount: {
					gte: race.price
				}
			},
			data: {
				amount: {
					decrement: race.price
				}
			}
		});
		if (removedGold.count !== 1) {
			throw new ExpectedError('notEnoughMoney');
		}
		/*
		 * Re-check the Dinoz capacity INSIDE the transaction.
		 *
		 * A check performed before the transaction would be
		 * vulnerable to concurrent purchases.
		 */
		const user = await tx.user.findUnique({
			where: {
				id: userId
			},
			select: {
				leader: true,
				messie: true
			}
		});
		if (!user) {
			throw new ExpectedError('userNotFound');
		}
		const activeDinozCount = await tx.dinoz.count({
			where: {
				userId,
				OR: [
					{
						state: null
					},
					{
						state: {
							not: {
								in: [DinozState.frozen, DinozState.sacrificed]
							}
						}
					}
				]
			}
		});
		const maxDinoz = getUserMaxDinoz(user);
		if (activeDinozCount >= maxDinoz) {
			throw new ExpectedError('tooManyActiveDinoz');
		}
		/*
		 * Claim this specific shop entry.
		 *
		 * If another transaction already purchased a Dinoz
		 * and cleared the shop, count will be 0 and the Gold
		 * debit above is rolled back.
		 */
		const claimedShopDinoz = await tx.userDinozShop.deleteMany({
			where: {
				id: shopDinozId,
				userId
			}
		});
		if (claimedShopDinoz.count !== 1) {
			throw new ExpectedError('dinozNotFound');
		}
		/*
		 * Buying one Dinoz refreshes the complete shop.
		 */
		await tx.userDinozShop.deleteMany({
			where: {
				userId
			}
		});
		const dinozProps = initializeDinoz(race, userId, shopDinoz.display);
		const dinozCreated = await tx.dinoz.create({
			data: dinozProps
		});
		/*
		 * Base race skills.
		 */
		const baseSkills = Object.values(skillList).filter(
			skill => skill.raceId?.some(raceId => raceId === race.raceId) && skill.isBaseSkill
		);
		if (baseSkills.length > 0) {
			await tx.dinozSkills.createMany({
				data: baseSkills.map(skill => ({
					dinozId: dinozCreated.id,
					skillId: skill.id
				}))
			});
		}
		/*
		 * GET_DINOZ tracking.
		 */
		await tx.userTracking.upsert({
			where: {
				stat_userId: {
					stat: StatTracking.GET_DINOZ,
					userId
				}
			},
			update: {
				quantity: {
					increment: 1
				}
			},
			create: {
				stat: StatTracking.GET_DINOZ,
				quantity: 1,
				userId
			}
		});
		/*
		 * Ranking.
		 *
		 * Increment both values atomically, then calculate
		 * average using the freshly updated row.
		 */
		const existingRanking = await tx.ranking.findUnique({
			where: {
				userId
			},
			select: {
				id: true
			}
		});
		if (!existingRanking) {
			throw new ExpectedError('User ranking not found');
		}
		const ranking = await tx.ranking.update({
			where: {
				userId
			},
			data: {
				dinozCount: {
					increment: 1
				},
				points: {
					increment: 1
				}
			},
			select: {
				id: true,
				dinozCount: true,
				points: true
			}
		});
		await tx.ranking.update({
			where: {
				id: ranking.id
			},
			data: {
				average: ranking.dinozCount > 0 ? Math.round(ranking.points / ranking.dinozCount) : 0
			}
		});
		const wallet = await tx.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId,
					type: MoneyType.GOLD
				}
			}
		});
		return {
			dinozCreated,
			price: race.price,
			wallet
		};
	});
	/*
	 * Logs only AFTER COMMIT.
	 */
	safeCreateGameLog({
		type: GameLogType.GoldLost,
		userId,
		values: [String(result.price)],
		metadata: {
			amount: result.price,
			wallet: MoneyType.GOLD,
			previousAmount: result.wallet.amount + result.price,
			newAmount: result.wallet.amount
		}
	});
	safeCreateGameLog({
		type: GameLogType.CreateDinoz,
		userId,
		dinozId: result.dinozCreated.id,
		dinozNameSnapshot: result.dinozCreated.name,
		metadata: {
			raceId: result.dinozCreated.raceId,
			display: result.dinozCreated.display,
			level: result.dinozCreated.level
		}
	});
	return result.dinozCreated;
}
