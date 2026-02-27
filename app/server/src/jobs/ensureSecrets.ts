import { prisma } from '../prisma.js';

export async function ensureSecretsExist(log?: { info: Function }) {
	const secret = await prisma.secret.upsert({
		where: { key: 'itinerant' },
		create: { key: 'itinerant', value: '5' },
		update: {}
	});

	log?.info?.(`[bootstrap] itinerant secret ensured (value=${secret.value})`);
}
