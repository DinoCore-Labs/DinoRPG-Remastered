import { FastifyRequest } from 'fastify';

import { getAverageRanking } from '../Service/getAverageRanking.service.js';
import { getClassicRanking } from '../Service/getClassicRanking.service.js';
import { getUserRankingPosition } from '../Service/getUserPositionRanking.service.js';

export async function getRanking(
	req: FastifyRequest<{
		Params: { sort: string; page: string };
	}>
) {
	const { sort, page } = req.params;
	const pageNum = Number(page);

	let ranking;

	switch (sort) {
		case 'classic':
			ranking = await getClassicRanking(pageNum);
			break;

		case 'average':
			ranking = await getAverageRanking(pageNum);
			break;

		default:
			ranking = await getClassicRanking(pageNum);
			break;
	}

	return ranking;
}

export async function getMyRanking(req: FastifyRequest) {
	const userId = req.user.id;
	return {
		position: await getUserRankingPosition(userId)
	};
}
