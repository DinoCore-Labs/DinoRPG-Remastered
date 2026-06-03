import { BANK_EXCHANGE_RATE_SECRET_KEY, generateBankExchangeRateBps } from '@dinorpg/core/models/bank/constants.js';

import { prisma } from '../prisma.js';

export async function ensureSecretsExist(log?: { info: Function }) {
	const secret = await prisma.secret.upsert({
		where: { key: 'itinerant' },
		create: { key: 'itinerant', value: '5' },
		update: {}
	});
	const bankRate = await prisma.secret.upsert({
		where: {
			key: BANK_EXCHANGE_RATE_SECRET_KEY
		},
		create: {
			key: BANK_EXCHANGE_RATE_SECRET_KEY,
			value: String(generateBankExchangeRateBps())
		},
		update: {}
	});
	log?.info?.(`[bootstrap] itinerant secret ensured (value=${secret.value})`);
	log?.info?.(`[bootstrap] bank exchange rate secret ensured (value=${bankRate.value})`);
}
