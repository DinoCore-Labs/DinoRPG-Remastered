import { placeList } from '@dinorpg/core/models/place/placeList.js';

import { setSpecificSecret } from '../controller/setSpecificSecret.js';

export async function itinerantMerchantMoveJob(log: { info: Function; error: Function }) {
	const now = new Date();

	// Lundi UTC
	if (now.getUTCDay() !== 1) return;

	const availablePlace = Object.values(placeList).filter(p => p.itinerant === true);

	if (availablePlace.length === 0) {
		log.error('[itinerant] no available itinerant places');
		return;
	}

	const random = Math.floor(Math.random() * availablePlace.length);
	const weekPlace = availablePlace[random];

	await setSpecificSecret('itinerant', String(weekPlace.placeId));
	log.info(`[itinerant] moved to ${weekPlace.name} (#${weekPlace.placeId})`);
}
