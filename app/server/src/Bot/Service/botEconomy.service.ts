import { getRace } from '@dinorpg/core/utils/dinozUtils.js';

import { DinozState, MoneyType } from '../../../../prisma/index.js';
import { getUserMaxDinoz } from '../../Dinoz/Controller/getActiveDinoz.js';
import { renameDinoz } from '../../Dinoz/Service/setDinozName.service.js';
import { prisma } from '../../prisma.js';
import { getOrCreateDinozShop } from '../../Shop/Controller/getOrCreateDinozShop.controller.js';
import { purchaseDinoz } from '../../Shop/Controller/purchaseDinoz.controller.js';

const BOT_GOLD_RESERVE = 1500;
const BOT_TARGET_DINOZ_COUNT = 2;

export async function canBotBuyAnotherDinoz(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			leader: true,
			messie: true,
			wallets: {
				where: { type: MoneyType.GOLD },
				select: { amount: true }
			},
			dinoz: {
				where: {
					OR: [
						{ state: null },
						{ state: { not: { in: [DinozState.frozen, DinozState.sacrificed] } } }
					]
				},
				select: { id: true }
			}
		}
	});
	if (!user) return false;
	if (user.dinoz.length >= BOT_TARGET_DINOZ_COUNT) return false;
	if (user.dinoz.length >= getUserMaxDinoz(user)) return false;

	const gold = user.wallets[0]?.amount ?? 0;
	const shop = await getOrCreateDinozShop(userId);
	if (shop.length === 0) return false;

	const cheapest = Math.min(...shop.map(entry => getRace(entry.race).price));
	return gold - cheapest >= BOT_GOLD_RESERVE;
}

export async function buyBotDinoz(userId: string) {
	const shop = await getOrCreateDinozShop(userId);
	const candidates = shop
		.map(entry => ({
			entry,
			price: getRace(entry.race).price
		}))
		.sort((a, b) => a.price - b.price);

	if (candidates.length === 0) return null;

	const wallet = await prisma.userWallet.findUnique({
		where: {
			userId_type: {
				userId,
				type: MoneyType.GOLD
			}
		}
	});
	if (!wallet) return null;

	const affordable = candidates.filter(candidate => wallet.amount - candidate.price >= BOT_GOLD_RESERVE);
	if (affordable.length === 0) return null;

	const selected = affordable[Math.floor(Math.random() * affordable.length)];
	const dinoz = await purchaseDinoz({
		userId,
		shopDinozId: Number(selected.entry.id)
	});

	await renameDinoz({
		userId,
		dinozId: dinoz.id,
		name: `Dinoz-${dinoz.id}`
	});

	return dinoz;
}
